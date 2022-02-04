const analyzeHackScript = "/hack/analyze-hack.js";

/** @param {NS} ns **/
export async function main(ns) {

    var homeInfo = ns.getServer("home");
    var serverList = {
        "home": homeInfo
    };
    while (true) {
        var breakFlag = true;
        for (var i in serverList) {
            var serverScan = ns.scan(i);
            for (var j in serverScan) {
                var serverName = serverScan[j]
                if (serverList.hasOwnProperty(serverName)) {
                    continue;
                }
                var serverInfo = ns.getServer(serverName);
                serverList[serverName] = serverInfo;
                breakFlag = false;
            }
        }
        if (breakFlag) {
            break;
        }
    }
    ns.tprint(`已找到服务器${Object.keys(serverList).length }个`)
    var adminServerList = [];
    var selfServerList = [];
    for (var i in serverList) {
        var serverInfo = serverList[i];
        if (serverInfo.hostname === "home") {
            continue;
        }
        if (serverInfo.purchasedByPlayer) {
            selfServerList.push(serverInfo);
            continue;
        }
        if (serverInfo.hasAdminRights) {
            if (serverInfo.hostname !== "n00dles" && serverInfo.hostname !== "foodnstuff") {
                if (serverInfo.serverGrowth >= 10) {
                    adminServerList.push(serverInfo);
                }
            }
        }
    }
    adminServerList = sortByServerGrowth(adminServerList)
    selfServerList = sortByRam(selfServerList)
    ns.tprint(`已有服务器${selfServerList.length}个   已駭入有价值服务器${adminServerList.length}个`)
    var l = Math.min(adminServerList.length, selfServerList.length);
    var mulServerCnt = 0;
    var hackCnt = 0;
    for (var i = 0; i < l; i++) {
        var myServer = selfServerList[i];
        var adminServer = adminServerList[i + mulServerCnt];
        var nowRam = myServer.maxRam;
        await ns.killall(myServer.hostname)
        await ns.scp(analyzeHackScript, 'home', myServer.hostname);
        do {
            var needRam = getHackNeedRam(ns, myServer, adminServer) * 1.1;
            ns.exec(analyzeHackScript, myServer.hostname, 1, "--name", adminServer.hostname);
            hackCnt++;
            ns.tprint(ns.sprintf('%12s (%10s) 将hack服务器 %18s (成长:%3d)  需要RAM %9s   剩余RAM %9s', myServer.hostname, formatRam(myServer.maxRam, 'G'), adminServer.hostname, adminServer.serverGrowth, formatRam(needRam, 'G'), formatRam(nowRam, 'G')))
            nowRam = nowRam - needRam;
            if (nowRam > 50) {
                mulServerCnt++;
                adminServer = adminServerList[i + mulServerCnt];
            }
            if (hackCnt > adminServerList.length - 1) {
                break;
            }
        } while (nowRam > 50)
        if (hackCnt > adminServerList.length - 1) {
            break;
        }
    }
    ns.tprint("=======================")
}

function sortByRam(list) {
    var len = list.length;
    for (var i = 0; i < len - 1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (list[j].maxRam < list[j + 1].maxRam) {
                var temp = list[j];
                list[j] = list[j + 1];
                list[j + 1] = temp;
            }
        }
    }
    return list;
}

function sortByServerGrowth(list) {
    var len = list.length;
    for (var i = 0; i < len - 1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (list[j].serverGrowth < list[j + 1].serverGrowth) {
                var temp = list[j];
                list[j] = list[j + 1];
                list[j + 1] = temp;
            }
        }
    }
    return list;
}

function formatRam(num, baseUnit) {
    if (baseUnit === 'G' || baseUnit === 'GB') {
        num *= 1
    };
    if (baseUnit === 'T' || baseUnit === 'TB') {
        num *= 1024
    };
    if (baseUnit === 'P' || baseUnit === 'PB') {
        num *= 1024 * 1024
    };
    if (num >= 1024 * 1024) {
        return `${(num / 1024 / 1024).toFixed(2)} PB`;
    } else if (num >= 1024) {
        return `${(num / 1024).toFixed(2)} TB`;
    } else {
        return `${num.toFixed(2)} GB`;
    }
}

function formatMoney(money) {
    if (money >= 1e12) {
        return `${(money / 1e12).toFixed(2)} t`;
    } else if (money >= 1e9) {
        return `${(money / 1e9).toFixed(2)} b`;
    } else if (money >= 1e6) {
        return `${(money / 1e6).toFixed(2)} m`;
    } else if (money >= 1000) {
        return `${(money / 1000).toFixed(2)} k`;
    } else {
        return `${money}`;
    }
}

const folder = "/hack";
const loopScript = `${folder}/hack-loop.js`;
const weakenScript = `${folder}/do-weaken.js`;
const growScript = `${folder}/do-grow.js`;
const hackScript = `${folder}/do-hack.js`;

function getHackNeedRam(ns, hostServer, server) {

    // 目标服务器当前情况
    const moneyMax = ns.getServerMaxMoney(server.hostname);
    const moneyThreshold = moneyMax * 0.8;
    const securityMin = server.minDifficulty;
    const securityThreshold = (server.baseDifficulty - securityMin) * 0.2 + securityMin;

    // 脚本内存占用
    const hackRam = ns.getScriptRam(hackScript);
    const weakenRam = ns.getScriptRam(weakenScript);
    const growRam = ns.getScriptRam(growScript);
    // 计算本轮循环，服务器状况
    const analyze = analyzeServer(ns, server);
    var money = ns.getServerMoneyAvailable(server.hostname);
    const security = ns.getServerSecurityLevel(server.hostname);

    // 计算本次需要进行的任务
    const needWeaken = security > securityThreshold;
    const needGrow = money < moneyThreshold;

    // 计算Weaken所需线程
    var weakenThread = 0;
    if (needWeaken) {
        weakenThread = Math.floor((security - securityThreshold) / analyze.weakenValue);
    }

    // 计算Grow所需线程
    var growThread = 0;
    var moneyTarget = money;
    if (needGrow) {
        if (money <= 0) money = 1;
        ns.print(`目标金额增长比例(${(moneyThreshold / money).toFixed(3)})`);
        growThread = Math.floor(ns.growthAnalyze(server.hostname, moneyThreshold / money));
        moneyTarget = moneyThreshold;
    }
    ns.print(`Hack金额目标(${formatMoney(moneyTarget)})`);

    // 计算Hack所需线程
    var hackThread = Math.ceil(1 / analyze.hackPercent);
    // [Bug] 防止计算出无限值，目前发现hackPercent有可能返回0
    if (hackThread === Infinity) {
        hackThread = 1000;
    }

    ns.print(`初步计算\nWeaken(t=${weakenThread}), 安全(${security.toFixed(2)}), 阈值(${securityThreshold.toFixed(2)})\nGrow(t=${growThread}), 当前(${formatMoney(money)}), 阈值(${(formatMoney(moneyThreshold))}),\nHack(t=${hackThread})`);
    // 判断Ram占用是否超出上限
    let freeRam = hostServer.maxRam - ns.getServerUsedRam(hostServer.hostname);
    var totalNeedRam = 0;
    let weakenNeedRam = weakenThread * weakenRam;
    let growNeedRam = growThread * growRam;
    let hackNeedRam = hackThread * hackRam;
    totalNeedRam = weakenNeedRam + growNeedRam + hackNeedRam;
    return totalNeedRam;
}

function analyzeServer(ns, server) {

    // 单个Thread一次hack
    const hackPercent = ns.hackAnalyze(server.hostname);
    // ns.print(`HackPercent: ${(hackPercent * 100).toFixed(2)} %`);

    // // hack成功率
    // const hackChance = ns.hackAnalyzeChance(server.hostname);
    // ns.print(`HackChance: ${hackChance * 100} %`);

    // hack导致的安全值上升
    // const hackSecurityGrow = ns.hackAnalyzeSecurity(1);
    // ns.print(`HackSecurityGrow: ${hackSecurityGrow}`);

    // 当前Hack时间
    const hackTime = ns.getHackTime(server.hostname);
    // ns.print(`HackTime: ${(hackTime / 1000).toFixed(2)} s`);

    // 单个Thread一次Weaken
    const weakenValue = ns.weakenAnalyze(1);
    // ns.print(`WeakenValue: ${weakenValue}`);

    // Weaken时间
    const weakenTime = ns.getWeakenTime(server.hostname);
    // ns.print(`WeakenTime: ${(weakenTime / 1000).toFixed(2)} s`);

    // // 单个Thread一次grow
    // const growPercent = ns.getServerGrowth(server.hostname);
    // ns.print(`GrowPercent: ${growPercent / 100} %`);

    // // grow导致的安全值上升
    // const growSecurityGrow = ns.growthAnalyzeSecurity(1);
    // ns.print(`GrowSecurityGrow: ${growSecurityGrow}`);

    // grow时间
    const growTime = ns.getGrowTime(server.hostname);
    // ns.print(`GrowTime: ${(growTime / 1000).toFixed(2)} s`);

    ns.print(`hack 成功率:${(hackPercent * 100).toFixed(2)}% 时间:${(hackTime / 1000).toFixed(2)}s `)
    ns.print(`Weaken 单次:${weakenValue} 时间:${(weakenTime / 1000).toFixed(2)}s `)
    ns.print(`Grow 时间: ${(growTime / 1000).toFixed(2)} s`);
    return {
        hackPercent,
        // hackChance,
        // hackSecurityGrow,
        hackTime,
        weakenValue,
        weakenTime,
        //growPercent,
        // growSecurityGrow,
        growTime
    };
}
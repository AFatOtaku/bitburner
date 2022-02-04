const analyzeHackScript = "/hack/analyze-hack.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    var cnt = 0;
    ns.tprint(`=======开始运行=======`);
    var own = ns.getPurchasedServers();
    var max = ns.getPurchasedServerLimit();
    var maxRam = ns.getPurchasedServerMaxRam();
    while (max - own.length > 0) {
        var ram = canBuyMaxRam(ns);
        if (ram > 1) {
            var serverName = ns.purchaseServer(`myServer-${own.length}`, ram);
            if (serverName !== '' && serverName !== null) {
                ns.tprint(`[${cnt}]购买服务器${serverName} ${formatRam(ram, 'G')}`)
            }
            own = ns.getPurchasedServers()
        } else {
            break;
        }
        await ns.sleep(1000);
    }
    // 升级服务器
    var checkServer = [];
    while (checkServer.length < own.length) {
        var minServer = '';
        var minRam = 10 * 1024 * 1024;
        for (var i in own) {
            var serverName = own[i]
            if (checkServer.includes(serverName)) {
                continue;
            }
            var nowRam = ns.getServerMaxRam(serverName)
            if (nowRam < minRam) {
                minRam = nowRam;
                minServer = serverName;
            }
        }
        if (minServer === '') {
            break;
        }
        checkServer.push(minServer)
        var ram = canBuyMaxRam(ns);
        if (ram > minRam) {
            await ns.killall(minServer)
            await ns.deleteServer(minServer)
            var minServer = ns.purchaseServer(`myServer`, ram);
            if (minServer !== '' && minServer !== null) {
                ns.tprint(`[${cnt}]升级服务器${minServer} ${formatRam(minRam, 'G')} -> ${formatRam(ram, 'G')}`)
            }
        }
    }
    ns.tprint(`=======运行结束=======`);
}

function canBuyMaxRam(ns) {
    var maxRam = ns.getPurchasedServerMaxRam();
    var canBuyRam = maxRam;
    while (myMoney(ns) < ns.getPurchasedServerCost(canBuyRam)) {
        canBuyRam = canBuyRam / 2;
        if (canBuyRam < 1024) {
            canBuyRam = -1;
            break;
        }
    }
    return canBuyRam
}

function myMoney(ns) {
    return ns.getServerMoneyAvailable("home");
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
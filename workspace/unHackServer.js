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
    var hackServerList = [];
    var unHackServerList = [];
    for (var serverName in serverList) {
        var serverInfo = serverList[serverName]
        if (!serverInfo.hasAdminRights) {
            unHackServerList.push(serverInfo);
        }
        if (serverInfo.hasAdminRights) {
            if (!serverInfo.purchasedByPlayer) {
                hackServerList.push(serverInfo);
            }
        }
    }
    hackServerList = sortByServerGrowth(hackServerList);
    unHackServerList = sortByHackLevel(unHackServerList);
    ns.tprint(`============未駭入(${unHackServerList.length})==============`)
    for (var i in unHackServerList) {
        var serverInfo = unHackServerList[i]
        ns.tprint(ns.sprintf("%20s 需要等级: %5d 需要端口: %1d", serverInfo.hostname, serverInfo.requiredHackingSkill, serverInfo.numOpenPortsRequired))
    }
    ns.tprint(`============已駭入(${hackServerList.length})==============`)
    for (var i in hackServerList) {
        var serverInfo = hackServerList[i];
        var ht = ns.getHackTime(serverInfo.hostname);
        var gt = ns.getGrowTime(serverInfo.hostname);
        var wt = ns.getWeakenTime(serverInfo.hostname);
        ns.tprint(ns.sprintf("%20s 等级: %5d 增长:%5d 最大金额:%9s", serverInfo.hostname, serverInfo.requiredHackingSkill, serverInfo.serverGrowth, formatMoney(serverInfo.moneyMax)))
        ns.tprint(`                                                               HT:${(ht / 1000).toFixed(2)}s  GT:${(gt / 1000).toFixed(2)}s  WT:${(wt / 1000).toFixed(2)}s  `)
    }
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

function sortByHackLevel(list) {
    var len = list.length;
    for (var i = 0; i < len - 1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (list[j].requiredHackingSkill < list[j + 1].requiredHackingSkill) {
                var temp = list[j];
                list[j] = list[j + 1];
                list[j + 1] = temp;
            }
        }
    }
    return list;
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
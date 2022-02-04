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
        if(!serverInfo.hasAdminRights){
            unHackServerList.push(serverInfo);
        }
        if(serverInfo.hasAdminRights){
            if(!serverInfo.purchasedByPlayer) {
                hackServerList.push(serverInfo);
            }
        }
    }
    hackServerList = sortByHackLevel(hackServerList);
    unHackServerList = sortByHackLevel(unHackServerList);
    ns.tprint(`============未駭入(${unHackServerList.length})==============`)
    for (var i in unHackServerList) {
        var serverInfo = unHackServerList[i]
        ns.tprint(ns.sprintf("%20s 需要等级: %5d 需要端口: %1d", serverInfo.hostname, serverInfo.requiredHackingSkill, serverInfo.numOpenPortsRequired))
    }
    ns.tprint(`============已駭入(${hackServerList.length})==============`)
    for (var i in hackServerList) {
        var serverInfo = hackServerList[i]
        ns.tprint(ns.sprintf("%20s 需要等级: %5d 需要端口: %1d", serverInfo.hostname, serverInfo.requiredHackingSkill, serverInfo.numOpenPortsRequired))
    }
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
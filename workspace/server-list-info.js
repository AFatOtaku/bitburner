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
    for (var serverName in serverList) {
        var serverInfo = serverList[serverName]
        ns.tprint(`${serverName}|${serverInfo.ip}|${serverInfo.numOpenPortsRequired}|${serverInfo.requiredHackingSkill}|${serverInfo.organizationName}|${serverInfo.cpuCores}|${serverInfo.maxRam}|${serverInfo.serverGrowth}|${(serverInfo.moneyMax / 1e6).toFixed(2)}|${serverInfo.baseDifficulty}|${serverInfo.minDifficulty}`)
    }
}
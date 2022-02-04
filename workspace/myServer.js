/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint(`=======开始运行=======`);
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
    var selfServerList = [];
    for (var i in serverList){
        var serverInfo = serverList[i];
        if(serverInfo.hostname === "home"){
            continue;
        }
        if(serverInfo.purchasedByPlayer){
            selfServerList.push(serverInfo);
        }
    }
    var max = ns.getPurchasedServerLimit();
    ns.tprint(`${selfServerList.length} / ${max}`);
    selfServerList = sortByRam(selfServerList)
    for (var i in selfServerList){
        var serverInfo = selfServerList[i];
        ns.tprint(`   ${serverInfo.hostname}  ${formatRam(serverInfo.maxRam,'G')}`)
    }
    ns.tprint(`=====================`);
}

function sortByRam(list) {
    var  len = list.length;
    for (var i = 0; i < len-1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (list[j].maxRam < list[j + 1].maxRam) {
                var temp = list[j];
                list[j] = list[j+1];
                list[j+1] = temp;
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
const analyzeHackScript = "/hack/analyze-hack.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    var cnt = 0;
    ns.tprint(`=======开始运行=======`);
    var own = ns.getPurchasedServers();
    var max = ns.getPurchasedServerLimit();
    ns.tprint(`目前能卖的最高服务器${formatRam(ns.getPurchasedServerMaxRam(),'G')}`)
    ns.tprint(`${formatRam(ns.getPurchasedServerMaxRam(),'G')} 服务器售价:${formatMoney(ns.getPurchasedServerCost(ns.getPurchasedServerMaxRam()))}`)
    while (myMoney(ns) > ns.getPurchasedServerCost(ns.getPurchasedServerMaxRam()) && max - own.length > 0) {
        var ram = ns.getPurchasedServerMaxRam();
        var serverName = ns.purchaseServer(`myServer-${own.length}`, ram);
        if (serverName !== '' && serverName !== null) {
            ns.tprint(`购买服务器${serverName} ${formatRam(ram, 'G')}`)
        }
        own = ns.getPurchasedServers()
        await ns.sleep(10);
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
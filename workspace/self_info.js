
/** @param {NS} ns **/
export async function main(ns) {

    let target = ns.args[0];
    let hostServer = ns.getServer(target);

    ns.tprint(`============${hostServer.hostname}(${hostServer.serverGrowth})===============`)
    // ns.tprint(`金额:${formatMoney(hostServer.moneyAvailable)} / ${formatMoney(hostServer.moneyMax)}`)
    ns.tprint(`金额:${hostServer.moneyAvailable} / ${hostServer.moneyMax}`)
    ns.tprint(`安全:${hostServer.hackDifficulty.toFixed(6)} (${hostServer.baseDifficulty} ~ ${hostServer.minDifficulty})`)
    ns.tprint(ns.hackAnalyze(hostServer.hostname))
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
        return `${money.toFixed(2)}`;
    }
}
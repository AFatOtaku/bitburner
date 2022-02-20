
/** @param {NS} ns **/
export async function main(ns) {

    var ram = ns.getPurchasedServerMaxRam();
    while(ram >= 1){
        var p = ns.getPurchasedServerCost(ram);
        ns.tprint(ns.sprintf("%10s 的服务器需要 %10s",formatRam(ram),formatMoney(p)));
        ram /=2;
    }

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
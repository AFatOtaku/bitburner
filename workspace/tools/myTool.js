/** @param {NS} ns **/
export async function main(ns) {

    // 格式化金钱
    function formatMoney(money) {
        if (money >= 1e12) {
            return `${(money / 1e12).toFixed(2)} t`;
        }
        else if (money >= 1e9) {
            return `${(money / 1e9).toFixed(2)} b`;
        }
        else if (money >= 1e6) {
            return `${(money / 1e6).toFixed(2)} m`;
        }
        else if (money >= 1000) {
            return `${(money / 1000).toFixed(2)} k`;
        }
        else {
            return `${money}`;
        }
    }

}
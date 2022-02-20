/** @param {NS} ns **/
export async function main(ns) {

    let targetList = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"];
    for(let j in targetList){
        let target = targetList[j];
        let serverLink = [target];
        let i = 0;
        while (serverLink.indexOf("home") == -1) {
            let serverScan = ns.scan(serverLink[i++], true);
            serverLink[serverLink.length] = serverScan[0];
        }
        ns.tprint(serverLink);
    }
}
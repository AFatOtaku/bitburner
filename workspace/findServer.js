/** @param {NS} ns **/
export async function main(ns) {

    let target = ns.args[0];
    let serverLink = [target];
    let i = 0;
    while (serverLink.indexOf("home") == -1) {
        let serverScan = ns.scan(serverLink[i++], true);
        serverLink[serverLink.length] = serverScan[0];
    }
    ns.tprint(serverLink);
}
const analyzeHackScript = "/hack/analyze-hack.js";

/** @param {NS} ns **/
export async function main(ns) {
    var l = [
        {'host':"home",'target':"n00dles"},
        {'host':"home-0",'target':"joesguns"},
    ]
    await ns.exec("/tools/scan-deploy-normal-hack.js", "home", 1);
    for(var i in l){
        var item = l[i]
        await ns.exec(analyzeHackScript, item["host"], 1, "--name", item["target"]);
    }
}
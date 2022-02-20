const analyzeHackScript = "/hack/analyze-hack.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint("==重生起手式")
    ns.tprint("====自动HACK脚本")
    await ns.exec("/tools/scan-deploy-normal-hack.js", "home", 1);
    var deployName = "home";
    var serverName = "n00dles";
    ns.tprint("====home 攻击 n00dles")
    if (!ns.serverExists(deployName)) {
		throw `部署服务器${deployName}不存在`;
	}
	if (!ns.serverExists(serverName)) {
		throw `Hack目标服务器${serverName}不存在`;
	}
	await ns.scp(analyzeHackScript, 'home', deployName);
	ns.exec(analyzeHackScript, deployName, 1, "--name", serverName);
    ns.tprint("====home 攻击 foodnstuff")
    serverName = "foodnstuff";
    if (!ns.serverExists(serverName)) {
		throw `Hack目标服务器${serverName}不存在`;
	}
	await ns.scp(analyzeHackScript, 'home', deployName);
	ns.exec(analyzeHackScript, deployName, 1, "--name", serverName);
}
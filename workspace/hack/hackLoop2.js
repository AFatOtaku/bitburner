/** @param {NS} ns **/
export async function main(ns) {

	const name = ns.args[0];
	const delay = ns.args[1];
	const hackScript = ns.args[2];
	const growScript = ns.args[3];
	const weakenScript = ns.args[4];

	ns.disableLog("ALL");
	await hackEventLoop(ns, name, delay, hackScript, growScript, weakenScript);
}

/**
 * Hack事件循环
 * @param {NS} ns
 * @param {string} name
 * @param {number} delayInterval
 * @param {string} hackScript
 * @param {string} growScript
 * @param {string} weakenScript
 */
async function hackEventLoop(ns, name, delayInterval, hackScript, growScript, weakenScript) {

	// 部署服务器
	const hostServer = ns.getServer();
	// 被Hack服务器
	const server = ns.getServer(name);

	// 脚本内存占用
	const hackRam = ns.getScriptRam(hackScript);
	const weakenRam = ns.getScriptRam(weakenScript);
	const growRam = ns.getScriptRam(growScript);
	// 循环计数
	var count = 0;
	// 进攻方服务器数据
	var maxRam = hostServer.maxRam;

	var moneyMax = server.moneyMax;
	// grow到的金钱目标 占服务器最高金额的比值
	const moneyThreshold = moneyMax * 0.9;
	const securityMin = server.minDifficulty;
	const securityThreshold = (server.baseDifficulty - securityMin) * 0.1 + securityMin;

	// 计算本轮循环，服务器状况
	const hackChance = ns.hackAnalyzeChance(server.hostname);
	const hackTime = ns.getHackTime(server.hostname);
	const hackSecurityGrow = ns.hackAnalyzeSecurity(1);
	const hackPercent = ns.hackAnalyze(server.hostname);
	const weakenValue = ns.weakenAnalyze(1, server.cpuCores);
	const weakenTime = ns.getWeakenTime(server.hostname);
	const growTime = ns.getGrowTime(server.hostname);
	const growSecurityGrow = ns.growthAnalyzeSecurity(1);
	const growPercent = ns.getServerGrowth(server.hostname);

	// 计算第一轮需要的数据和时间
	var firstSecurity = ns.getServerSecurityLevel(server.hostname);
	var firstMoney = ns.getServerMoneyAvailable(server.hostname);
	// 计算第一轮降安全
	var firstWeakenThread = Math.floor((firstSecurity - securityThreshold) / weakenValue);
	// 计算第一轮GROW
	var firstGrowThread = Math.floor(ns.growthAnalyze(server.hostname, moneyThreshold / firstMoney));
	// 计算第一轮 降补GROW长的安全
	var firstWeakenThreadForGrow = Math.floor(firstGrowThread * growSecurityGrow / weakenValue);
	var firstNeedRam = firstWeakenThread * weakenRam + firstGrowThread * growRam + firstWeakenThreadForGrow * weakenRam;

	// 计算正常值 线程/时间
	// 计算HACK
	var hackThread = Math.ceil(0.9 / hackPercent);
	var growThread = 1;
	while (true) {
		if (Math.pow(growPercent, growThread) > 10)
			break;
		growThread++;
	}
	hackThread = Math.floor(hackThread / hackChance);
	var weakenThreadForHack = Math.ceil(ns.hackAnalyzeSecurity(hackThread) / weakenValue);
	var weakenThreadForGrow = Math.ceil(ns.growthAnalyzeSecurity(growThread) / weakenValue);
	var turnNeedRam = hackThread * hackRam + growThread * growRam + weakenThreadForGrow * weakenRam + weakenThreadForHack * weakenRam;
	// 开局 降低安全 补满钱 降低补满提升的安全
	// 循环结算顺序 h -> w -> g -> w
	// th  "thname":{name ram end}
	var thList = {}
	var firstFlag = true;
	var nowLast = 0;
	if (firstWeakenThread > 0) {
		firstFlag = false;
		ns.exec(weakenScript, hostServer.hostname, firstWeakenThread, server.hostname, delayInterval);
		nowLast = delayInterval + weakenTime;
		thList[`f_w`] = {
			'ram': firstWeakenThread * weakenRam,
			'time': nowLast
		}
	}
	if (firstGrowThread > 0) {
		if (firstFlag) {
			firstFlag = false;
			// weaken要在grow之后
			nowLast = Math.max(weakenTime, growTime)
			nowLast += delayInterval;
			ns.exec(growScript, hostServer.hostname, firstGrowThread, server.hostname, nowLast - growTime);
			thList[`f_g`] = {
				'ram': firstGrowThread * weakenRam,
				'time': nowLast
			}
			nowLast += delayInterval;
			ns.exec(weakenScript, hostServer.hostname, firstWeakenThreadForGrow, server.hostname, nowLast - weakenTime);
			thList[`f_gw`] = {
				'ram': firstWeakenThreadForGrow * weakenRam,
				'time': nowLast
			}
		} else {
			nowLast += delayInterval;
			ns.exec(growScript, hostServer.hostname, firstGrowThread, server.hostname, nowLast - growTime);
			thList[`f_g`] = {
				'ram': firstGrowThread * weakenRam,
				'time': nowLast
			}
			nowLast += delayInterval;
			ns.exec(weakenScript, hostServer.hostname, firstWeakenThreadForGrow, server.hostname, nowLast - weakenTime);
			thList[`f_gw`] = {
				'ram': firstWeakenThreadForGrow * weakenRam,
				'time': nowLast
			}
		}
	}
	while (true) {
		hackThread = Math.ceil(0.9 / hackPercent);
		growThread = 1;
		while (true) {
			if (Math.pow(growPercent, growThread) > 10)
				break;
			growThread++;
		}
		hackThread = Math.floor(hackThread / hackChance);
		weakenThreadForHack = Math.ceil(ns.hackAnalyzeSecurity(hackThread) / weakenValue);
		weakenThreadForGrow = Math.ceil(ns.growthAnalyzeSecurity(growThread) / weakenValue);
		turnNeedRam = hackThread * hackRam + growThread * growRam + weakenThreadForGrow * weakenRam + weakenThreadForHack * weakenRam;
		while (true) {
			var totalRam = 0;
			for (var i in thList) {
				totalRam += thList[i]['ram'];
			}
			// 开始按组添加
			if (maxRam - totalRam > turnNeedRam) {
				count++;
				nowLast += delayInterval;
				ns.exec(hackScript, hostServer.hostname, hackThread, server.hostname, nowLast - hackTime);
				thList[`${count}_h`] = {
					'ram': hackThread * hackRam,
					'time': nowLast
				}
				nowLast += delayInterval;
				ns.exec(weakenScript, hostServer.hostname, weakenThreadForHack, server.hostname, nowLast - weakenTime);
				thList[`${count}_hw`] = {
					'ram': weakenThreadForHack * weakenRam,
					'time': nowLast
				}
				nowLast += delayInterval;
				ns.exec(growScript, hostServer.hostname, growThread, server.hostname, nowLast - growTime);
				thList[`${count}_g`] = {
					'ram': growThread * growRam,
					'time': nowLast
				}
				nowLast += delayInterval;
				ns.exec(weakenScript, hostServer.hostname, weakenThreadForGrow, server.hostname, nowLast - weakenTime);
				thList[`${count}_gw`] = {
					'ram': weakenThreadForGrow * weakenRam,
					'time': nowLast
				}
				ns.print(`组${count}已添加`)
			} else {
				break;
			}
		}
		// 等待到下一个动作的完成
		var minTime = 1e300;
		for (var i in thList) {
			if (minTime > thList[i]['time']) {
				minTime = thList[i]['time']
			}
		}
		ns.print(`等待${minTime}ms`)
		await ns.sleep(minTime)
		// 删除过期值
		for (var i in thList) {
			if (thList[i]['time'] <= minTime) {
				delete thList[i];
			} else {
				thList[i]['time'] = thList[i]['time'] - minTime;
			}
		}
	}
}

/**
 * 金额格式化
 */
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
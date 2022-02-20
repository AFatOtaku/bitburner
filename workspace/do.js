const analyzeHackScript = "/hack/analyze-hack.js";
const folder = "/hack";
const loopScript = `${folder}/hack-loop.js`;
const weakenScript = `${folder}/do-weaken.js`;
const growScript = `${folder}/do-grow.js`;
const hackScript = `${folder}/do-hack.js`;
// 自动部署的Hack脚本
const scriptName = "/hack/normal-hack.js";
const factionTotalList = [
	"CyberSec",
	"Tian Di Hui",
	"Netburners",
	"Sector-12",
	"Aevum",
	"Chongqing",
	"New Tokyo",
	"Ishima",
	"Volhaven",
	"NiteSec",
	"The Black Hand",
	"BitRunners",
	"ECorp",
	"MegaCorp",
	"KuaiGong International",
	"Four Sigma",
	"NWO",
	"Blade Industries",
	"OmniTek Incorporated",
	"Bachman & Associates",
	"Clarke Incorporated",
	"Fulcrum Secret Technologies",
	"Slum Snakes",
	"Tetrads",
	"Silhouette",
	"Speakers for the Dead",
	"The Dark Army",
	"The Syndicate",
	"The Covenant",
	"Daedalus",
	"Illuminati",
]


/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tprint("==开始全自动转生")
	let cnt = 0;
	let serverBackdoor = [0, 0, 0, 0, 0]
	let factionList = []
	while (true) {
		let haveAugList = ns.getOwnedAugmentations(true);
		cnt++;

		factionList = getFacTionList(ns);

		// 自动位派系工作
		work(ns)
		
		// 自动hack
		await scanServerAndHack(ns, "home");

		// 给服务器装后门
		await installBackDoor(ns, serverBackdoor);

		// 同意派系邀请
		await acceptFaction(ns, factionList);

		// 分析能够购买的插件
		let augCnt = haveAugList.length;
		buyAug(ns, 1 + Math.floor(augCnt / 3));

		

		// 自动升级服务器
		await updateServer(ns)

		// 自动购买
		await buy(ns)

		ns.tprint(ns.sprintf("%7d 运行完成", cnt))
		await ns.sleep(60 * 1000)
		// break;
	}
}

function getFacTionList(ns) {
	let factionList = []
	for (let i in factionTotalList) {
		let faction = factionTotalList[i];
		let c = ns.workForFaction(faction, "Hacking Contracts", false)
		if (c) {
			factionList.push(faction)
			continue
		} else {
			c = ns.workForFaction(faction, "Field Work", false)
			if (c){
				factionList.push(faction)
			}
		}
	}
	return factionList;
}

async function buy(ns){
	ns.purchaseTor()
	if (!ns.fileExists("BruteSSH.exe", "home")) ns.purchaseProgram("BruteSSH.exe");
	if (!ns.fileExists("FTPCrack.exe", "home")) ns.purchaseProgram("FTPCrack.exe");
	if (!ns.fileExists("relaySMTP.exe", "home")) ns.purchaseProgram("relaySMTP.exe");
	if (!ns.fileExists("HTTPWorm.exe", "home")) ns.purchaseProgram("HTTPWorm.exe");
	if (!ns.fileExists("SQLInject.exe", "home")) ns.purchaseProgram("SQLInject.exe");
	if (!ns.fileExists("ServerProfiler.exe", "home")) ns.purchaseProgram("ServerProfiler.exe");
	if (!ns.fileExists("DeepscanV1.exe", "home")) ns.purchaseProgram("DeepscanV1.exe");
	if (!ns.fileExists("DeepscanV2.exe", "home")) ns.purchaseProgram("DeepscanV2.exe");
	if (!ns.fileExists("AutoLink.exe", "home")) ns.purchaseProgram("AutoLink.exe");
	if (!ns.fileExists("Formulas.exe", "home")) ns.purchaseProgram("Formulas.exe");
	if (myMoney > ns.getUpgradeHomeCoresCost()) ns.upgradeHomeCores();
	if (myMoney > ns.getUpgradeHomeRamCost()) {ns.upgradeHomeRam();await setServer("home")};
}

async function setServer(ns, host) {
	var myServer = ns.getServer(host)
	var homeInfo = ns.getServer("home");
    var serverList = {
        "home": homeInfo
    };
	var adminServerList = [];
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
    for (var i in serverList) {
        var serverInfo = serverList[i];
        if (serverInfo.hostname === "home") {
            continue;
        }
        if (serverInfo.purchasedByPlayer) {
            continue;
        }
        if (serverInfo.hasAdminRights) {
            if (serverInfo.serverGrowth >= 10 && serverInfo.moneyMax > 0) {
                adminServerList.push(serverInfo);
            }
        }
    }
	adminServerList = sortByServerGrowthAndHackTime(adminServerList,30,ns)

	var l = adminServerList.length;
    var hackCnt = 0;
	for (var i = 0; i < l; i++) {
        var adminServer = adminServerList[i];
        var nowRam = ns.getServerMaxRam(host);
        if (myServer.hostname === "home") {
            nowRam -= 30;
            var plist = ns.ps();
            for (var k in plist) {
                var pname = plist[k]["filename"];
                var pid = plist[k]["pid"]
                if (pname !== "do.js") {
                    await ns.kill(pid,"home");
                }
            }
        } else {
            await ns.killall(myServer.hostname)
        }
        await ns.scp(analyzeHackScript, 'home', host);
        do {
            var needRam = getHackNeedRam(ns, myServer, adminServer) * 1.1;
            ns.exec(analyzeHackScript, myServer.hostname, 1, "--name", adminServer.hostname);
            hackCnt++;
            var ht = ns.getHackTime(adminServer.hostname);
            nowRam = nowRam - needRam;
            if (nowRam > 50) {
                adminServer = adminServerList[i];
            }
            if (hackCnt > adminServerList.length - 1) {
                break;
            }
        } while (nowRam > 50)
        if (hackCnt > adminServerList.length - 1) {
            break;
        }
    }

	for (var j = 0; j < adminServerList.length; j++) {
		var adminServer = adminServerList[j];
		ns.exec(analyzeHackScript, host, 1, "--name", adminServer.hostname);
	}
	ns.tprint(`设置服务器${host}的hack脚本完毕`)
}

async function updateServer(ns) {
	var own = ns.getPurchasedServers();
    var max = ns.getPurchasedServerLimit();
    var maxRam = ns.getPurchasedServerMaxRam();
    while (max - own.length > 0) {
        var ram = canBuyMaxRam(ns);
        if (ram > 1) {
            var serverName = ns.purchaseServer(`myServer-${own.length}`, ram);
            if (serverName !== '' && serverName !== null) {
                ns.tprint(`购买服务器${serverName} ${formatRam(ram, 'G')}`)
				await setServer(ns, serverName);
            }
            own = ns.getPurchasedServers()
        } else {
            break;
        }
        await ns.sleep(10);
    }
    // 升级服务器
    var checkServer = [];
    while (checkServer.length < own.length) {
        var minServer = '';
        var minRam = 10 * 1024 * 1024;
        for (var i in own) {
            var serverName = own[i]
            if (checkServer.includes(serverName)) {
                continue;
            }
            var nowRam = ns.getServerMaxRam(serverName)
            if (nowRam < minRam) {
                minRam = nowRam;
                minServer = serverName;
            }
        }
        if (minServer === '') {
            break;
        }
        checkServer.push(minServer)
        var ram = canBuyMaxRam(ns);
        if (ram > minRam) {
            await ns.killall(minServer)
            await ns.deleteServer(minServer)
            var minServer = ns.purchaseServer(`myServer`, ram);
            if (minServer !== '' && minServer !== null) {
                ns.tprint(`升级服务器${minServer} ${formatRam(minRam, 'G')} -> ${formatRam(ram, 'G')}`)
				await setServer(ns, serverName);
            }
        }
    }
}

function work(ns) {
	let haveAugList = ns.getOwnedAugmentations(true);
	let spAug = "NeuroFlux Governor";
	let reverseFactionTotalList = factionTotalList.reverse();
	for (let i in reverseFactionTotalList) {
		let faction = reverseFactionTotalList[i];
		let factionRep = ns.getFactionRep(faction);
		let factionAugList = ns.getAugmentationsFromFaction(faction);
		let maxRep = 0;
		for (let j in factionAugList) {
			let aug = factionAugList[j];
			if (aug == spAug) {
				continue
			}
			let repReq = ns.getAugmentationRepReq(aug)
			if (repReq > maxRep) {
				maxRep = repReq
			}
		}
		if (factionRep < maxRep && ns.getFavorToDonate() > ns.getFactionFavor(faction)) {
			let c = ns.workForFaction(faction, "Hacking Contracts", !isInArray(haveAugList, "Neuroreceptor Management Implant"))
			if (c) {
				break
			}
		} else if (ns.getFavorToDonate() <= ns.getFactionFavor(faction)) {
			while (true) {
				factionRep = ns.getFactionRep(faction);
				let money = ns.getServerMoneyAvailable("home");
				if (money < 100000000 || factionRep > maxRep) {
					break;
				}
				ns.donateToFaction(faction, 100000000);
			}
		}
	}
}

function buyAug(ns, buyCnt) {
	let spAug = "NeuroFlux Governor";
	let spPrice = ns.getAugmentationPrice(spAug);
	let spRep = ns.getAugmentationRepReq(spAug);
	let maxRep = 0;
	let maxRepFaction = "";
	let money = ns.getServerMoneyAvailable("home");
	let augMap = {};
	let factionRepList = {};
	let haveAugList = ns.getOwnedAugmentations(true);
	// 获取能够购买的插件列表
	for (let i in factionTotalList) {
		let faction = factionTotalList[i];
		let factionRep = ns.getFactionRep(faction);
		if (factionRep > maxRep) {
			maxRep = factionRep;
			maxRepFaction = faction;
		}
		factionRepList[faction] = factionRep;
		let factionAugList = ns.getAugmentationsFromFaction(faction);
		for (let j in factionAugList) {
			let aug = factionAugList[j];
			if (aug != spAug) {
				let price = ns.getAugmentationPrice(aug)
				let repReq = ns.getAugmentationRepReq(aug)
				let preList = ns.getAugmentationPrereq(aug)
				let preCheck = true;
				for (let ii in preList) {
					let preAug = preList[ii]
					if (!isInArray(haveAugList, preAug)) {
						preCheck = false;
					}
				}
				if (preCheck && repReq < factionRep && !isInArray(haveAugList, aug)) {
					let augItem = augMap[aug]
					if (augItem == null) {
						let hostList = [faction]
						augItem = {
							"name": aug,
							"price": price,
							"rep": repReq,
							"host": hostList,
						}
					} else {
						let hostList = augItem["host"]
						hostList.push(faction)
						augItem["host"] = hostList;
					}
					augMap[aug] = augItem
				}
			}
		}
	}
	var augList = [];
	// 计算能够购买几个插件
	for (let i in augMap) {
		let item = augMap[i];
		augList.push(item);
	}
	augList.sort(function (a, b) {
		return b["price"] - a["price"]
	})
	let totalPrice = 0;
	let mul = 1;
	let spMul = 1;
	let buyList = [];
	let aList = [];
	// 判断能买的插件
	for (let i in augList) {
		let item = augList[i]
		let price = item['price']
		if ((totalPrice + price * mul) < money) {
			buyList.push(item["name"])
			aList.push(item["name"])
			totalPrice += price * mul;
			mul *= 1.9;
		} else {
			break;
		}
	}
	// 重复购买特殊插件
	while (true) {
		if (totalPrice + spPrice * spMul * mul < money && maxRep > spRep * spMul) {
			buyList.push(spAug)
			mul *= 1.9;
			spMul *= 1.4;
		} else {
			break
		}
	}
	if (aList.length > buyCnt) {
		for (let i in buyList) {
			let aug = buyList[i]
			if (aug == spAug) {
				ns.tprint(ns.sprintf("将在 %20s 购买 %35s", maxRepFaction, spAug))
				ns.purchaseAugmentation(maxRepFaction, spAug)
			} else {
				let item = augMap[aug]
				let hostList = item["host"]
				let host = hostList[hostList.length - 1]
				let price = item["price"]
				ns.tprint(formatMoney(price));
				ns.tprint(ns.sprintf("将在 %20s 购买 %35s", host, aug))
				ns.purchaseAugmentation(host, aug)
			}
		}
		ns.installAugmentations("do.js")
	} else {
		ns.tprint(`可购买插件${aList.length}(${buyList.length})/${buyCnt},数量不足 等待`)
	}
}

async function acceptFaction(ns, factionList) {
	let fl = ns.checkFactionInvitations();
	for (let i in fl) {
		let f = fl[i];
		ns.joinFaction(f)
		factionList.push(f)
	}
	let m = ns.getServerMoneyAvailable("home");
	if (m > 15000000 && !isInArray(factionList, "Sector-12")) {
		ns.travelToCity("Sector-12")
		ns.tprint(`旅行到Sector-12`)
		await ns.sleep(1000)
	}
	if (m > 40000000 && !isInArray(factionList, "Aevum")) {
		ns.travelToCity("Aevum")
		ns.tprint(`旅行到Aevum`)
		await ns.sleep(1000)
	}
}

async function installBackDoor(ns, serverBackdoor) {
	let serverList = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "fulcrumassets"]
	for (let i in serverList) {
		ns.connect("home")
		let target = serverList[i];
		if (serverBackdoor[i] == 1) {
			continue;
		}
		if (ns.hasRootAccess(target)) {
			let serverLink = [target];
			let k = 0;
			while (serverLink.indexOf("home") == -1) {
				let serverScan = ns.scan(serverLink[k++], true);
				serverLink[serverLink.length] = serverScan[0];
			}
			serverLink = serverLink.reverse();
			for (let j in serverLink) {
				if (j == 0) {
					continue;
				}
				ns.connect(serverLink[j])
			}
			await ns.installBackdoor();
			serverBackdoor[i] = 1;
		}

	}
	ns.connect("home")
}

function scanServer(ns, name, exclude) {

	// 获取扫描列表
	const scanList = ns.scan(name);
	const list = [];
	// 移除排除项
	for (var item of scanList) {
		if (item === exclude || item === 'home') continue;
		list.push(item);
	}

	return list;
}

/**
 * 扫描服务器
 */
async function scanServerAndHack(ns, name, exclude) {

	// 获取扫描列表
	const scanList = ns.scan(name);
	const list = scanServer(ns, name, exclude)

	if (list.length > 0) {
		for (var s of list) {
			const server = ns.getServer(s);
			const can = canHackServer(ns, server);
			if (can) {
				var firstHack = runHackTools(ns, server);
				// if (firstHack && server.moneyMax !== 0) {
				await hackServer(ns, server)
				// }
			}
			await scanServer(ns, s, name);
		}
	}

	return list;
}

/**
 * 检查当前破解工具个数
 */
function getCurrentPortTools(ns) {
	var tools = 0;
	if (ns.fileExists("BruteSSH.exe", "home")) tools++;
	if (ns.fileExists("FTPCrack.exe", "home")) tools++;
	if (ns.fileExists("relaySMTP.exe", "home")) tools++;
	if (ns.fileExists("HTTPWorm.exe", "home")) tools++;
	if (ns.fileExists("SQLInject.exe", "home")) tools++;
	return tools;
}

/** 
 * 使用破解工具
 **/
function runHackTools(ns, server) {
	// 已经root
	if (server.hasAdminRights) return false;
	if (!server.sshPortOpen && ns.fileExists("BruteSSH.exe", "home")) ns.brutessh(server.hostname);
	if (!server.ftpPortOpen && ns.fileExists("FTPCrack.exe", "home")) ns.ftpcrack(server.hostname);
	if (!server.smtpPortOpen && ns.fileExists("relaySMTP.exe", "home")) ns.relaysmtp(server.hostname);
	if (!server.httpPortOpen && ns.fileExists("HTTPWorm.exe", "home")) ns.httpworm(server.hostname);
	if (!server.sqlPortOpen && ns.fileExists("SQLInject.exe", "home")) ns.sqlinject(server.hostname);
	ns.nuke(server.hostname);
	ns.tprint(`获得服务器${server.hostname}控制权`)
	return true;
}

/** 
 * 判断服务器是否可以Hack
 **/
function canHackServer(ns, server) {

	// 服务器属于自己的，跳过
	if (server.purchasedByPlayer) {
		return;
	}

	// 检查hack等级
	const hackLvl = ns.getHackingLevel();
	const targetHackLvl = server.requiredHackingSkill;
	if (targetHackLvl > hackLvl) {
		ns.print(ns.sprintf("%20s 需求 %5d  当前%d", server.hostname, targetHackLvl, hackLvl));
		return false;
	}

	// 检查端口需求
	const tools = getCurrentPortTools(ns);
	const targetPorts = server.numOpenPortsRequired;
	if (targetPorts > tools) {
		return false;
	}

	return true;
}

/** 
 * 复制脚本到目标服务器，并执行Hack
 **/
async function hackServer(ns, server) {

	// 计算脚本能开多少线程
	const targetName = server.hostname;
	const needRam = ns.getScriptRam(scriptName);
	const free = server.maxRam - server.ramUsed;
	const thread = parseInt((free / needRam).toString());
	if (thread > 0) {
		ns.print(`${targetName}能部署线程：${thread}个`);
		await ns.scp(scriptName, 'home', targetName);
		ns.exec(scriptName, targetName, thread, server.hostname);
	}
}

function isInArray(arr, value) {
	for (var i = 0; i < arr.length; i++) {
		if (value === arr[i]) {
			return true;
		}
	}
	return false;
}

function indexInArray(arr, value) {
	for (var i = 0; i < arr.length; i++) {
		if (value === arr[i]) {
			return i;
		}
	}
	return -1;
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
		return `${money.toFixed(2)}}`;
	}
}

function canBuyMaxRam(ns) {
    var maxRam = ns.getPurchasedServerMaxRam();
    var canBuyRam = maxRam;
    while (myMoney(ns) < ns.getPurchasedServerCost(canBuyRam)) {
        canBuyRam = canBuyRam / 2;
        if (canBuyRam < 32) {
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

function sortByRam(list) {
    var len = list.length;
    for (var i = 0; i < len - 1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (list[j].maxRam < list[j + 1].maxRam) {
                var temp = list[j];
                list[j] = list[j + 1];
                list[j + 1] = temp;
            }
        }
    }
    return list;
}

function sortByServerGrowth(list) {
    var len = list.length;
    for (var i = 0; i < len - 1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (list[j].serverGrowth < list[j + 1].serverGrowth) {
                var temp = list[j];
                list[j] = list[j + 1];
                list[j + 1] = temp;
            }
        }
    }
    return list;
}

function getHackNeedRam(ns, server) {

    // 目标服务器当前情况
    const moneyMax = ns.getServerMaxMoney(server.hostname);
    const moneyThreshold = moneyMax * 0.8;
    const securityMin = server.minDifficulty;
    const securityThreshold = (server.baseDifficulty - securityMin) * 0.2 + securityMin;

    // 脚本内存占用
    const hackRam = ns.getScriptRam(hackScript);
    const weakenRam = ns.getScriptRam(weakenScript);
    const growRam = ns.getScriptRam(growScript);
    // 计算本轮循环，服务器状况
    const analyze = analyzeServer(ns, server);
    var money = ns.getServerMoneyAvailable(server.hostname);
    const security = ns.getServerSecurityLevel(server.hostname);

    // 计算本次需要进行的任务
    const needWeaken = security > securityThreshold;
    const needGrow = money < moneyThreshold;

    // 计算Weaken所需线程
    var weakenThread = 0;
    if (needWeaken) {
        weakenThread = Math.floor((security - securityThreshold) / analyze.weakenValue);
    }

    // 计算Grow所需线程
    var growThread = 0;
    var moneyTarget = money;
    if (needGrow) {
        if (money <= 0) money = 1;
        ns.print(`目标金额增长比例(${(moneyThreshold / money).toFixed(3)})`);
        growThread = Math.floor(ns.growthAnalyze(server.hostname, moneyThreshold / money));
        moneyTarget = moneyThreshold;
    }
    ns.print(`Hack金额目标(${formatMoney(moneyTarget)})`);

    // 计算Hack所需线程
    var hackThread = Math.ceil(1 / analyze.hackPercent);
    // [Bug] 防止计算出无限值，目前发现hackPercent有可能返回0
    if (hackThread === Infinity) {
        hackThread = 1000;
    }

    ns.print(`初步计算\nWeaken(t=${weakenThread}), 安全(${security.toFixed(2)}), 阈值(${securityThreshold.toFixed(2)})\nGrow(t=${growThread}), 当前(${formatMoney(money)}), 阈值(${(formatMoney(moneyThreshold))}),\nHack(t=${hackThread})`);
    var totalNeedRam = 0;
    let weakenNeedRam = weakenThread * weakenRam;
    let growNeedRam = growThread * growRam;
    let hackNeedRam = hackThread * hackRam;
    totalNeedRam = weakenNeedRam + growNeedRam + hackNeedRam;
    return totalNeedRam;
}

function analyzeServer(ns, server) {

    // 单个Thread一次hack
    const hackPercent = ns.hackAnalyze(server.hostname);
    // ns.print(`HackPercent: ${(hackPercent * 100).toFixed(2)} %`);

    // // hack成功率
    // const hackChance = ns.hackAnalyzeChance(server.hostname);
    // ns.print(`HackChance: ${hackChance * 100} %`);

    // hack导致的安全值上升
    // const hackSecurityGrow = ns.hackAnalyzeSecurity(1);
    // ns.print(`HackSecurityGrow: ${hackSecurityGrow}`);

    // 当前Hack时间
    const hackTime = ns.getHackTime(server.hostname);
    // ns.print(`HackTime: ${(hackTime / 1000).toFixed(2)} s`);

    // 单个Thread一次Weaken
    const weakenValue = ns.weakenAnalyze(1);
    // ns.print(`WeakenValue: ${weakenValue}`);

    // Weaken时间
    const weakenTime = ns.getWeakenTime(server.hostname);
    // ns.print(`WeakenTime: ${(weakenTime / 1000).toFixed(2)} s`);

    // // 单个Thread一次grow
    // const growPercent = ns.getServerGrowth(server.hostname);
    // ns.print(`GrowPercent: ${growPercent / 100} %`);

    // // grow导致的安全值上升
    // const growSecurityGrow = ns.growthAnalyzeSecurity(1);
    // ns.print(`GrowSecurityGrow: ${growSecurityGrow}`);

    // grow时间
    const growTime = ns.getGrowTime(server.hostname);
    // ns.print(`GrowTime: ${(growTime / 1000).toFixed(2)} s`);

    ns.print(`hack 成功率:${(hackPercent * 100).toFixed(2)}% 时间:${(hackTime / 1000).toFixed(2)}s `)
    ns.print(`Weaken 单次:${weakenValue} 时间:${(weakenTime / 1000).toFixed(2)}s `)
    ns.print(`Grow 时间: ${(growTime / 1000).toFixed(2)} s`);
    return {
        hackPercent,
        // hackChance,
        // hackSecurityGrow,
        hackTime,
        weakenValue,
        weakenTime,
        //growPercent,
        // growSecurityGrow,
        growTime
    };
}

function sortByServerGrowthAndHackTime(list,check,ns) {
    var len = list.length;
    for (var i = 0; i < len - 1; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            var c1 = list[j].serverGrowth;
            var c2 = list[j + 1].serverGrowth;
            if(ns.getHackTime(list[j].hostname) > check * 1000){
                c1 -= 9999;
            }
            if(ns.getHackTime(list[j + 1].hostname) > check * 1000){
                c2 -= 9999;
            }
            if (c1 < c2) {
                var temp = list[j];
                list[j] = list[j + 1];
                list[j + 1] = temp;
            }
        }
    }
    return list;
}
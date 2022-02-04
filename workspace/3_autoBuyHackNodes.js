/** @param {NS} ns **/
export async function main(ns) {
    const params = ns.flags([
        ['nodes', 20],
        // 类型 normal(160,32,8)  max(200,64,8)
        ['type', 'normal']
    ]);

    var {
        nodes,
        type
    } = params;
    var targetNodes = nodes;
    var targetLevel = 160;
    var targetRam = 32;
    var targetCore = 8;
    if (type === 'max') {
        targetLevel = 200;
        targetRam = 64;
        targetCore = 16;
    }
    ns.disableLog("ALL");
    ns.print(`=======开始运行=======`)
    // ranRank : 以Ram以2为底求的对数,用来计算需要升级的次数
    var targetRamRank = Math.round(Math.LOG2E * Math.log(targetRam));
    var cnt = 0;
    while (true) {
        cnt++;
        var breakFlag = true;
        // 处理购买新节点
        var nowNodes = ns.hacknet.numNodes();
        while (ns.hacknet.numNodes() < targetNodes && myMoney(ns) > ns.hacknet.getPurchaseNodeCost()) {
            ns.hacknet.purchaseNode();
            ns.print(`[${cnt}] N ${nowNodes} -> ${ns.hacknet.numNodes()}`)
            nowNodes = ns.hacknet.numNodes();
        }
        // 遍历节点
        for (var i = 0; i < ns.hacknet.numNodes(); i++) {
            var nodeInfo = ns.hacknet.getNodeStats(i);
            var nowLevel = nodeInfo.level;
            var nowRam = nodeInfo.ram;
            var nowCore = nodeInfo.cores;
            var nowRamRank = Math.round(Math.LOG2E * Math.log(nowRam));
            var nl1 = 0;
            var nr1 = 0;
            var nc1 = 0;
            // 升级节点等级
            for (var updateLevel = targetLevel - nowLevel; updateLevel > 0; updateLevel--) {
                if (myMoney(ns) > ns.hacknet.getLevelUpgradeCost(i, updateLevel)) {
                    var f = ns.hacknet.upgradeLevel(i, updateLevel)
                    if (f) {
                        nl1 = ns.hacknet.getNodeStats(i).level;
                    }
                    break;
                }
            }
            // 升级内存等级
            for (var updateRamRank = targetRamRank - nowRamRank; updateRamRank > 0; updateRamRank--) {
                if (myMoney(ns) > ns.hacknet.getRamUpgradeCost(i, updateRamRank)) {
                    var f = ns.hacknet.upgradeRam(i, updateRamRank)
                    if (f) {
                        nr1 = ns.hacknet.getNodeStats(i).ram;
                    }
                    break;
                }
            }
            // 升级核心等级
            for (var updateCore = targetCore - nowCore; updateCore > 0; updateCore--) {
                if (myMoney(ns) > ns.hacknet.getCoreUpgradeCost(i, updateCore)) {
                    var f = ns.hacknet.upgradeCore(i, updateCore)
                    if (f) {
                        nc1 = ns.hacknet.getNodeStats(i).cores;
                    }
                    break;
                }
            }
            if (nl1 != 0 || nr1 != 0 || nc1 != 0) {
                var s = `[${cnt}][N${i}]`
                if (nl1 != 0) {
                    s += ` L ${nowLevel}->${nl1}`
                }
                if (nr1 != 0) {
                    s += ` R ${nowRam}G->${nr1}G`
                }
                if (nc1 != 0) {
                    s += ` C ${nowCore} -> ${nc1}`
                }
                ns.print(s)
            }
            nodeInfo = ns.hacknet.getNodeStats(i);
            nowLevel = nodeInfo.level;
            nowRam = nodeInfo.ram;
            nowCore = nodeInfo.cores;
            nowRamRank = Math.round(Math.LOG2E * Math.log(nowRam));
            if (nowLevel < targetLevel || nowRam < targetRam || nowCore < targetCore) {
                breakFlag = false;
            }
        }
        if (ns.hacknet.numNodes() < targetNodes) {
            breakFlag = false;
        }
        if (breakFlag) {
            ns.print(`全部目标完成`)
            break
        }
        await ns.sleep(5 * 1000)
    }
    ns.print(`=======运行结束=======`)
}

function myMoney(ns) {
    return ns.getServerMoneyAvailable("home");
}
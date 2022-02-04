/** @param {NS} ns **/
export async function main(ns) {

    ns.disableLog('ALL')
    //自动在服务器上挂载黑客脚本
    while (true) {
        var servers = ns.scan("home")

        for (var i = 0; i < servers.length; i++) {

            //判断服务器是否仍存在
            if (ns.serverExists(servers[i]) === false) continue
            var serverInfo = ns.getServer(servers[i])
            if (serverInfo.purchasedByPlayer) {
                continue;
            }

            ns.print('--处理' + servers[i] + '中:')
            //判断是否有权限和是否能破解
            if (ns.hasRootAccess(servers[i]) === false) {
                ns.print('----' + servers[i] + '尝试破解中')
                if (ns.getServerRequiredHackingLevel(servers[i]) > ns.getHackingLevel()) {
                    ns.print('----' + servers[i] + '黑客等级不足，暂时无法破解')
                    continue
                }
                var ports = [
                    ['BruteSSH.exe', ns.brutessh],
                    ['FTPCrack.exe', ns.ftpcrack],
                    ['relaySMTP.exe', ns.relaysmtp],
                    ['HTTPWorm.exe', ns.httpworm],
                    ['SQLInject.exe', ns.sqlinject],
                ]
                var need_port = ns.getServerNumPortsRequired(servers[i])
                var port = 0
                for (var j in ports) {
                    if (ns.fileExists(ports[j][0])) {
                        ports[j][1](servers[i])
                        port++
                    }
                    if (port >= need_port) {
                        ns.nuke(servers[i])
                    }
                }
                //如果仍然没破解成功，就暂时放弃该服务器
                if (ns.hasRootAccess(servers[i]) === false) {
                    ns.print('----' + servers[i] + '端口不足，暂时无法破解')
                    continue
                }
                ns.print('----' + servers[i] + '破解成功')
            }
            
            var add_servers = ns.scan(servers[i]).slice(1)
            if (add_servers.length > 0) {
                ns.print('--追加' + add_servers.length + '个服务器到备选列表')
                ns.print('--' + add_servers)
                servers = servers.concat(add_servers)
            }

            //判断目标服务器有没有脚本，如果没有就复制一个过去
            if (ns.fileExists('1.script', servers[i]) === false) {
                ns.print('----复制文件到' + servers[i])
                await ns.scp('1.script', 'home', servers[i])
            }

            //如果服务器还有足够的剩余内存，就拿来跑脚本
            var left = ns.getServerMaxRam(servers[i]) - ns.getServerUsedRam(servers[i])
            var use = ns.getScriptRam('1.script', servers[i])
            ns.print('----' + servers[i] + '剩余内存' + formatRam(left, 'G') + '，需要内存' + formatRam(use, 'G'))
            if (left / use >= 1 && ns.getServerMaxRam(servers[i]) > 4) {
                ns.print('----' + servers[i] + '执行脚本')
                await ns.exec('1.script', servers[i], parseInt(left / use))
            } else if (left >= 2) {
                ns.print('----' + servers[i] + '执行简易脚本')
                await ns.scp('1_easy.script', 'home', servers[i])
                await ns.exec('1_easy.script', servers[i], parseInt(left / 2))
            }
        }
        ns.print('--休眠60秒')
        await ns.sleep(1000 * 60)
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
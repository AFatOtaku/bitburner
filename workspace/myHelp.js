/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint("[ run /tools/scan-deploy-normal-hack.js ] 自动扫描当前所有服务器，并对当前可攻击的服务器，依次部署normal-hack.js脚本，然后展开攻击，该命令适用于转生早期，不适用于高手。")
    ns.tprint("[ run /tools/buy-server.js --name [自定义服务器名] --size [购买大小] --unit [购买单位，默认不传则是GB，可选TB] (--help 可选) ] 通过该脚本购买自定义服务器，仅需要指定服务器名字和大小即可。")
    ns.tprint("[ run /tools/run-analyze-hack.js <部署服务器> <Hack目标服务器> ] 复制analyze-hack脚本到部署服务器上，然后在部署服务器上执行动态分析Hack脚本，攻击目标服务器，该命令适用于高内存的服务器。")
    ns.tprint("CSEC: home -> joesguns -> CSEC")
    ns.tprint("run /tools/run-analyze-hack.js home n00dles")
    ns.tprint("run /tools/run-analyze-hack.js home joesguns")
}


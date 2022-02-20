const script = "/hack/do-hack.js";

/** @param {NS} ns **/
export async function main(ns) {
    let target = ns.args[0];
    let thread = ns.args[1];
    ns.exec(script, "home", thread, target, 100);
}
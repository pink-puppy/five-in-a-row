const fs = require('fs');
const ts = require('typescript');
const spawn = require('cross-spawn');
console.clear();
const args = process.argv.splice(2);
const source = args[0] || 'proto.ts';
const dest = args[3] || 'protocol.ts';

if (!fs.existsSync(source)) {
    console.error('Source declaration file does not exists');
    process.exit(0);
}

const program = ts.createProgram([source], {
    target: ts.ScriptTarget.Latest
});
const checker = program.getTypeChecker();
const sourceFile = program.getSourceFile(source);

let packets = [];
const creates = [];
ts.forEachChild(sourceFile, n => {
    if (ts.isInterfaceDeclaration(n)) {
        const symbol = checker.getSymbolAtLocation(n.name);
        const packetName = symbol.getName();
        let fn_args = [];
        let members = [];
        symbol.members.forEach(member => {
            const type = checker.getTypeOfSymbolAtLocation(member, member.valueDeclaration);
            const memberName = member.getName();
            if (!type.isLiteral()) {
                members.push(memberName)
                fn_args.push(`${memberName}:${checker.typeToString(type)}`)
            } else {
                members.push(`${memberName}:${type.value}`);
            }
        });
        const template = `export function CREATE_${packetName}(${fn_args.join(',')}): ${packetName} {
            return {${members.join(',')}}}`;
        creates.push(template);
        packets.push(packetName);
    }
});

let sourceContent = fs.readFileSync(source).toString();
const exportAllMessage = `export type Message = ` + packets.join(' | ') + ';';
sourceContent += '\r\n' + exportAllMessage + '\r\n';

sourceContent += creates.join('\r\n');
sourceContent += `\r\nexport function decode(raw: string): Message | undefined {
    let obj = undefined;
    try {
        obj = JSON.parse(raw);
    } catch (_) {
        return undefined;
    }
    if (!obj || !('action' in obj)) return undefined;
    return obj as Message;
}
`
fs.writeFileSync(dest, sourceContent);

const child = spawn('npx', ['tsc', '-d', 'protocol.ts'], { stdio: 'inherit' });
child.on('close', code => {
    if (code !== 0) {
        console.error('creation failed.')
    }
    console.log('done');
});



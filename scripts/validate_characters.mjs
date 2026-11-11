import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const people=read("lore/characters/index_v0.1.json").characters;
const orgs=[...read("lore/organizations/index.json").organizations,...read("lore/organizations/cross_category_seed_v0.1.json").organizations];
const links=read("lore/characters/affiliations_v0.1.json").relations;
const status=read("lore/characters/biography_status_registry_v1.json");
const problems=[],warnings=[];
const personIds=new Set(),orgIds=new Set();
for (const p of people) {if(personIds.has(p.id))problems.push("duplicate person: "+p.id);personIds.add(p.id);}
for(const o of orgs){if(orgIds.has(o.id))warnings.push("duplicate org id across category lists: "+o.id);orgIds.add(o.id);}
for(const a of links){if(!personIds.has(a.character_id))problems.push("missing person in affiliation: "+a.character_id);if(!orgIds.has(a.organization_id))problems.push("missing organization in affiliation: "+a.organization_id);}
for(const p of people){
const fname=path.join(root,"lore/characters/biographies",p.id+".v1.json");
const row=status.characters.find(x=>x.character_id===p.id);
if(!row)problems.push("person absent from status registry: "+p.id);
const exists=fs.existsSync(fname);
if(row&&Boolean(row.biography_path)!==exists)problems.push("registry/file mismatch: "+p.id);
if(exists){try{const b=JSON.parse(fs.readFileSync(fname,"utf8"));if(b.character_id!==p.id)problems.push("wrong biography ID in "+fname);if(!(Array.isArray(b.historical_sections)||Array.isArray(b.sections)))problems.push("missing narrative sections: "+p.id);if(b.verification?.complete===true)warnings.push("requires manual chapter proof before claiming verified: "+p.id);}catch(e){problems.push("unreadable biography "+p.id+": "+e.message);}}
}
if(status.characters.length!==people.length)problems.push("registry size does not match person index");
const summary={characters:people.length,individual_biographies:people.filter(p=>fs.existsSync(path.join(root,"lore/characters/biographies",p.id+".v1.json"))).length,affiliations:links.length,organizations:orgIds.size,problems:problems.length,warnings:warnings.length};
console.log(JSON.stringify({summary,problems,warnings},null,2));
if(problems.length)process.exitCode=1;

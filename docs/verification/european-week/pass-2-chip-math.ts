import {COMPETITIONS} from '../../../src/lib/competitions.ts'
import {chipInk} from '../../../src/lib/chipInk.ts'
import {rgb,ratio,composite,css,parseColor} from '../../../tests/contrast.ts'
const fills=Object.entries(COMPETITIONS).map(([key,c])=>({key,fill:c.color,white:ratio(rgb('#ffffff'),rgb(c.color)),ink:chipInk(c.color),current:ratio(rgb(chipInk(c.color)),rgb(c.color))}))
const inactive=[]
for(const theme of ['light','dark']){
 const block=css.match(theme==='light'?/:root\s*\{([^}]+)\}/:/\[data-theme='dark'\]\s*\{([^}]+)\}/)![1]!
 const tokens=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]))
 for(const ground of ['bg','surface']){
  const bg=parseColor(tokens[ground]).color,fg=parseColor(tokens['text-secondary']).color
  inactive.push({theme,ground,foreground:tokens['text-secondary'],background:tokens[ground],current:ratio(fg,bg),faded:ratio(composite(fg,bg,0.5),bg)})
 }
}
const result={fills,inactive};console.log(JSON.stringify(result,null,2))

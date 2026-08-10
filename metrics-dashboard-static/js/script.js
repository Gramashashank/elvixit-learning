const servers=['App-01','App-02','DB-01','Cache-01'];
const history={cpu:Array.from({length:10},(_,i)=>60+i%4),mem:Array.from({length:10},(_,i)=>55+i%3)};
const state={selectedMetric:'cpu',autoRefresh:true,metrics:{cpu:68,memory:62,disk:44,network:380}};
const metricMeta={
  cpu:{label:'CPU',unit:'%',title:'CPU Overview',text:'Core utilization is stable and within normal limits.',badge:'Stable',color:'#4f8cff'},
  memory:{label:'Memory',unit:'%',title:'Memory Overview',text:'Memory pressure remains low and headroom is healthy.',badge:'Healthy',color:'#10b981'},
  disk:{label:'Disk',unit:'%',title:'Disk Overview',text:'Storage usage is trending normally with spare capacity available.',badge:'Normal',color:'#f59e0b'},
  network:{label:'Network',unit:' Mbps',title:'Network Overview',text:'Throughput is steady and packet loss remains negligible.',badge:'Steady',color:'#8b5cf6'},
  overview:{label:'Overview',unit:'',title:'Operations Overview',text:'The platform is operating normally with no active incidents.',badge:'All Clear',color:'#1d4ed8'}
};
function r(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function setMetricValue(id,value,unit){
  const el=document.getElementById(id);
  if(!el){return;}
  el.textContent=unit==='%'?`${value}%`:`${value} ${unit}`.trim();
}
function updateProgressBars(){
  const bars={cpu:document.getElementById('cpuBar'),mem:document.getElementById('memBar'),disk:document.getElementById('diskBar'),net:document.getElementById('netBar')};
  Object.entries(state.metrics).forEach(([key,value])=>{
    const bar=bars[key];
    if(!bar){return;}
    const width=Math.min(100,Math.max(8,value));
    bar.style.width=`${width}%`;
  });
}
function updateStatusBadges(){
  const statusMap={
    cpu:state.metrics.cpu>80?'Warning':'Healthy',
    memory:state.metrics.memory>80?'Warning':'Healthy',
    disk:state.metrics.disk>85?'Warning':'Healthy',
    network:state.metrics.network<100?'Warning':'Healthy'
  };
  document.getElementById('cpuStatus').textContent=statusMap.cpu;
  document.getElementById('cpuStatus').className=`pill ${statusMap.cpu==='Warning'?'warning':'healthy'}`;
  document.getElementById('memStatus').textContent=statusMap.memory;
  document.getElementById('memStatus').className=`pill ${statusMap.memory==='Warning'?'warning':'healthy'}`;
  document.getElementById('diskStatus').textContent=statusMap.disk;
  document.getElementById('diskStatus').className=`pill ${statusMap.disk==='Warning'?'warning':'healthy'}`;
  document.getElementById('netStatus').textContent=statusMap.network;
  document.getElementById('netStatus').className=`pill ${statusMap.network==='Warning'?'warning':'healthy'}`;
}
function renderDetailPanel(){
  const meta=metricMeta[state.selectedMetric]||metricMeta.overview;
  document.getElementById('selectedMetricTitle').textContent=meta.title;
  document.getElementById('selectedMetricText').textContent=meta.text;
  document.getElementById('selectedMetricBadge').textContent=meta.badge;
  document.querySelectorAll('.metric-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.metric===state.selectedMetric));
  document.querySelectorAll('.metric-card').forEach(card=>card.classList.toggle('active',card.dataset.metric===state.selectedMetric));
}
function drawChart(svgId, values, color){
  const svg=document.getElementById(svgId);
  if(!svg){return;}
  const width=320,height=140,padding=20;
  const max=Math.max(100,...values);
  const min=0;
  const points=values.map((value,index)=>{
    const x=padding + (index/(Math.max(values.length-1,1)))*(width-padding*2);
    const y=height-padding - ((value-min)/(max-min||1))*(height-padding*2);
    return `${x},${y}`;
  }).join(' ');
  const grid=Array.from({length:5},(_,i)=>{
    const y=padding + ((height-padding*2)/4)*i;
    return `<line x1="${padding}" y1="${y}" x2="${width-padding}" y2="${y}" stroke="#e5eaf2" stroke-width="1" />`;
  }).join('');
  svg.innerHTML=`
    <rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="#f8fbff"></rect>
    ${grid}
    <polyline fill="none" stroke="${color}" stroke-width="3" points="${points}" />
    <circle cx="${padding + (values.length-1)/(Math.max(values.length-1,1))*(width-padding*2)}" cy="${height-padding - ((values[values.length-1]-min)/(max-min||1))*(height-padding*2)}" r="5" fill="${color}" />
  `;
}
function updateTable(){
  const tb=document.getElementById('tbody');tb.innerHTML='';
  servers.forEach(s=>{
    const serverCpu=r(20,95),serverMem=r(30,90),status=serverCpu>80||serverMem>80?'Warning':'Healthy';
    tb.innerHTML+=`<tr><td>${s}</td><td>${status}</td><td>${serverCpu}%</td><td>${serverMem}%</td></tr>`;
  });
}
function update(){
  if(!state.autoRefresh){return;}
  state.metrics.cpu=r(20,95);
  state.metrics.memory=r(30,90);
  state.metrics.disk=r(40,95);
  state.metrics.network=r(50,900);
  setMetricValue('cpu',state.metrics.cpu,'%');
  setMetricValue('mem',state.metrics.memory,'%');
  setMetricValue('disk',state.metrics.disk,'%');
  setMetricValue('net',state.metrics.network,'Mbps');
  updateProgressBars();
  updateStatusBadges();
  history.cpu.push(state.metrics.cpu);history.mem.push(state.metrics.memory);
  history.cpu=history.cpu.slice(-10);history.mem=history.mem.slice(-10);
  drawChart('cpuChart',history.cpu,'#4f8cff');
  drawChart('memChart',history.mem,'#10b981');
  updateTable();
  renderDetailPanel();
}
function selectMetric(metric){
  state.selectedMetric=metric;
  renderDetailPanel();
}
document.querySelectorAll('.metric-btn').forEach(btn=>btn.addEventListener('click',()=>selectMetric(btn.dataset.metric)));
document.querySelectorAll('.metric-card').forEach(card=>card.addEventListener('click',()=>selectMetric(card.dataset.metric)));
document.getElementById('refreshToggle').addEventListener('click',()=>{
  state.autoRefresh=!state.autoRefresh;
  document.getElementById('refreshToggle').textContent=state.autoRefresh?'Pause Auto Refresh':'Resume Auto Refresh';
});
update();
setInterval(update,2500);
// instruments список (пример, адаптируешь под свои данные)
const instruments = [
    {id: 1, name: "Kick", limbs: ["RF","LF"], imageUrl: "icons/kick.png"},
    {id: 2, name: "Snare", limbs: ["RH","LH"], imageUrl: "icons/snare.png"},
    {id: 3, name: "Hi-hat", limbs: ["RH","LH"], imageUrl: "icons/hihat.png"},
    // и другие инструменты по аналогии!
  ];
  
  // Текущий активный инструмент:
  let activeInstrumentId = null;
  
  // Рендерим инструменты панели:
  function renderInstruments(){
    const panel = document.getElementById('instrument-panel');
    panel.innerHTML = '';
  
    instruments.forEach(instr=>{
      const btn = document.createElement('button');
      btn.classList.add('instrument');
      btn.dataset.id = instr.id;
      btn.innerHTML = `<img src="${instr.imageUrl}" alt="${instr.name}" title="${instr.name}" width="40">`;
  
      btn.onclick = ()=>{
        if(activeInstrumentId === instr.id){
          activeInstrumentId = null; 
          btn.classList.remove('active');
        }else{
          activeInstrumentId = instr.id;
          document.querySelectorAll('.instrument').forEach(i=>i.classList.remove('active'));
          btn.classList.add('active');
        }
      };
  
      panel.appendChild(btn);
    });
  }
  
  renderInstruments(); // сразу рисуем
  
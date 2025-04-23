// Инициализация sequencerData (вне генератора отдельно)
const sequencerData = {};

// Инициализируем пустой структурой перед запуском генератора:
function initSequencerData(config){
  for(let b=0; b<config.blocksCount; b++){
    sequencerData[b] = {};
    config.rows.forEach(row=>{
      const rowId = row.id;
      sequencerData[b][rowId] = Array(config.cellsPerRow[b][rowId]).fill(null);
    });
  }
}

initSequencerData(sequencerConfig); // сразу вызвали!

const SequencerPlayer = {
    isPlaying: false,
    tempoBPM: 120,
    duration: '16', //'4', '8', '16'
    currentBlock: 0,
    currentStep: 0,
    intervalId: null,
  
    start() {
      if (this.isPlaying) return;
      this.isPlaying = true;
  
      const intervalMs = (60000 / this.tempoBPM) / ({'4': 1, '8': 2, '16': 4}[this.duration]);
  
      this.intervalId = setInterval(() => {
        this.updateVisualPosition();
        this.advancePosition();
      }, intervalMs);
    },
  
    stop() {
      this.isPlaying = false;
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.currentStep = 0;
      this.currentBlock = 0;
      this.updateVisualPosition();
    },
  
    advancePosition() {
        const currentBlockData = sequencerData[this.currentBlock];
        const maxSteps = Math.max(...sequencerConfig.rows.map(
          row => currentBlockData[row.id]?.length ?? 4
        ));
      
        this.currentStep++;
      
        if (this.currentStep >= maxSteps) {
          this.currentStep = 0;
      
          // ТУТ исправляем! проверяем по currentLoopBlockIndex, а не по классу loop
          const loopOn = (currentLoopBlockIndex === this.currentBlock);
      
          if (!loopOn) {
            this.currentBlock = (this.currentBlock + 1) % sequencerConfig.blocksCount;
          }
          // если loop включен, блок повторяется (ничего менять не надо дополнительно)
        }
      },
      
      

  
      updateVisualPosition() {
        // Убираем любую предыдущую подсветку
        document.querySelectorAll('.cell').forEach(cell => {
          cell.classList.remove('active-step');
        });
      
        // Если плеер остановлен, ничего не подсвечиваем
        if (!this.isPlaying) return;
      
        // А если запущен – подсвечиваем текущую активную ячейку
        document.querySelectorAll(`.cell[data-block="${this.currentBlock}"][data-cell="${this.currentStep}"]`)
                .forEach(cell => cell.classList.add('active-step'));
      },
      
  
    setTempo(bpm) {
      this.tempoBPM = bpm;
      if (this.isPlaying) {
        this.stop();
        this.start();
      }
    },
  
    setDuration(newDuration) {
      this.duration = newDuration;
      if (this.isPlaying) {
        this.stop();
        this.start();
      }
    },
  
    setPosition(blockIndex, stepIndex) {
      this.currentBlock = blockIndex;
      this.currentStep = stepIndex;
      this.updateVisualPosition();
    },
  };
  
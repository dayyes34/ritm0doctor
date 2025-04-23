const SequencerPlayer = {
    isPlaying: false,
    tempoBPM: 120,
    duration: '16', //'4', '8', '16'
    currentBlock: 0,
    currentStep: 0,
    loop: null,
  
    samples: {},
  
    async initSamples() {
      const samples = {
        kick: 'samples/kick.mp3',
        snare: 'samples/snare.mp3',
        hat: 'samples/hat.mp3',
        // добавь остальные инструменты здесь с правильными путями и ID
      };
      this.samples = new Tone.Players(samples).toDestination();
      await Tone.loaded();
      console.log("Samples loaded");
    },
  
    start() {
      if (this.isPlaying) return;
      Tone.Transport.cancel(); //чтобы предотвратить наложение событий
      Tone.Transport.bpm.value = this.tempoBPM;
      let interval = { '4': '4n', '8': '8n', '16': '16n' }[this.duration];
  
      this.loop = new Tone.Loop(time => {
        this.playCurrentStep(time);
        this.advancePosition();
        this.updateVisualPosition();
      }, interval).start(0);
  
      Tone.Transport.start();
      this.isPlaying = true;
    },
  
    stop() {
      this.isPlaying = false;
      if (this.loop) {
        this.loop.stop();
        this.loop.dispose();
        this.loop = null;
      }
      Tone.Transport.stop();
      this.currentStep = 0;
      this.currentBlock = 0;
      this.updateVisualPosition();
    },
  
    playCurrentStep(time) {
      const currentBlockData = sequencerData[this.currentBlock];
      sequencerConfig.rows.forEach(row => {
        // Check mute
        const limbMuted = mutedLimbs[row.id.toUpperCase()];
        if (limbMuted) return;
  
        const rowSteps = currentBlockData[row.id];
        const instrumentId = rowSteps[this.currentStep];
        if (instrumentId && this.samples.has(instrumentId)) {
          this.samples.player(instrumentId).start(time);
        }
      });
    },
  
    advancePosition() {
      const currentBlockData = sequencerData[this.currentBlock];
      let maxSteps = Math.max(...sequencerConfig.rows.map(r => currentBlockData[r.id]?.length ?? 4));
  
      this.currentStep++;
      if (this.currentStep >= maxSteps) {
        this.currentStep = 0;
  
        const blockElement = document.querySelector(`.block[data-block="${this.currentBlock}"]`);
        const loopOn = blockElement?.classList.contains('loop');
  
        if (!loopOn) {
          this.currentBlock = (this.currentBlock + 1) % sequencerConfig.blocksCount;
        }
      }
    },
  
    updateVisualPosition() {
      document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('active-step');
      });
      document.querySelectorAll(`.cell[data-block="${this.currentBlock}"][data-cell="${this.currentStep}"]`)
              .forEach(cell => cell.classList.add('active-step'));
    },
  
    setTempo(bpm) {
      this.tempoBPM = bpm;
      Tone.Transport.bpm.value = bpm;
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
  
  //инициализируй сразу при загрузке страницы:
  SequencerPlayer.initSamples();

  document.getElementById('startStop').onclick = () => {
    SequencerPlayer.isPlaying ? SequencerPlayer.stop() : SequencerPlayer.start();
  };
  
  document.getElementById('tempoSlider').oninput = (e) => {
    let bpm = parseInt(e.target.value, 10);
    SequencerPlayer.setTempo(bpm);
    document.getElementById('tempoValue').innerText = bpm + ' BPM';
  };
  
  document.getElementById('durationSelect').onchange = (e) => {
    SequencerPlayer.setDuration(e.target.value);
  };
  
  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', e => {
      const block = parseInt(e.currentTarget.dataset.block);
      const step = parseInt(e.currentTarget.dataset.cell);
      SequencerPlayer.setPosition(block, step);
    });
  });
  
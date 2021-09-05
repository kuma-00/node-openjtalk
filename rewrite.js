const path = require('path');
const uuid = require('uuid-v4');
const fs = require('fs').promises;
const util = require('util');
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);
const { Readable } = require('stream');

// デフォルトパラメタ
const DefaultOptions = {
  openjtalk_bin: path.join(__dirname, '/bin/open_jtalk'),
  dic_dir: path.join(__dirname, '/dic/open_jtalk_dic_utf_8-1.09'),
  htsvoice: path.join(__dirname, '/voice/mei/mei_normal.htsvoice'),
  wav_dir: '.',
};

const HtsvoiceFiles = {
  M001: path.join(__dirname, "/voice/hts_voice_nitech_jp_atr503_m001-1.05/nitech_jp_atr503_m001.htsvoice"),
  MEI_ANGRY: path.join(__dirname, "/voice/mei/mei_angry.htsvoice"),
  MEI_BASHFUL: path.join(__dirname, "/voice/mei/mei_bashful.htsvoice"),
  MEI_HAPPY: path.join(__dirname, "/voice/mei/mei_happy.htsvoice"),
  MEI_NORMAL: path.join(__dirname, "/voice/mei/mei_normal.htsvoice"),
  MEI_SAD: path.join(__dirname, "/voice/mei/mei_sad.htsvoice"),
  TOHOKU_ANGRY: path.join(__dirname, "/voice/htsvoice-tohoku-f01-master/tohoku-f01-angry.htsvoice"),
  TOHOKU_HAPPY: path.join(__dirname, "/voice/htsvoice-tohoku-f01-master/tohoku-f01-happy.htsvoice"),
  TOHOKU_NORMAL: path.join(__dirname, "/voice/htsvoice-tohoku-f01-master/tohoku-f01-normal.htsvoice"),
  TOHOKU_SAD: path.join(__dirname, "/voice/htsvoice-tohoku-f01-master/tohoku-f01-sad.htsvoice"),
  TAKUMI_ANGRY: path.join(__dirname, "/voice/takumi/takumi_angry.htsvoice"),
  TAKUMI_HAPPY: path.join(__dirname, "/voice/takumi/takumi_happy.htsvoice"),
  TAKUMI_NORMAL: path.join(__dirname, "/voice/takumi/takumi_normal.htsvoice"),
  TAKUMI_SAD: path.join(__dirname, "/voice/takumi/takumi_sad.htsvoice"),
  SLT: path.join(__dirname, "/voice/slt/cmu_us_arctic_slt.htsvoice")
}

class OpenJTalk {
  constructor(options) {
    Object.assign(this, DefaultOptions, options)
  }

  async speak(text, options) {
    text = text.replace(";", "");
    Object.assign(this, options)
    const wavFileName = uuid() + '.wav';
    /**
     * htsvoice
     * pitch
     * gv_weight_lf0
     * additional_half_tone
     * alpha
     * speech_speed
     */
    let ojtCmd = this.openjtalk_bin;
    const cmdOptions = {
      m: this.htsvoice,
      x: this.dic_dir,
      s: 48000,
      p: this.pitch,
      a: this.alpha,
      b: this.beta,
      u: this.uv_threshold,
      jm: this.gv_weight_mgc,
      jf: this.gv_weight_lf0,
      z: this.audio_buff_size,
      fm: this.additional_half_tone,
      r: this.speech_speed,
      ow: path.join(this.wav_dir, wavFileName)
    };
    for (let option in cmdOptions) {
      const value = cmdOptions[option];
      if (value) {
        ojtCmd += ' -' + option + ' ' + value;
      }
    }
    try {
      const cmd = 'echo "' + text + '" | ' + ojtCmd;
      await exec(cmd);
      const buf = await fs.readFile(wavFileName);
      fs.unlink(wavFileName);
      return buf;
    } catch (error) {
      throw error;
    }
  }

  async speakStream(text, options) {
    class SynthesizedSoundStream extends Readable {
      constructor(wave) {
        super();
        this.wave_p = wave.then(wave => {
          this.buf = wave.data;
          if (wave.sampleRate != 48000) {
            this._emitError(new Error(`Invalid sampleRate(Required 48000): ${wave.sampleRate}`));
            return false;
          }
          return true;
        }, err => {
          this._emitError(err);
          return false;
        });
      }
      _emitError(err) {
        if (!this.destroyed) {
          this.emit("error", err);
        }
      }
      _read(size = 48000 * 2 * 2 / 1000 * 20) {
        if (!this.buf) {
          this.wave_p.then((continues) => {
            if (continues) {
              this._read(size);
            }
          })
          return;
        }
        const offset = this.pos;
        let end = Math.ceil(size / 4);
        if (end + offset > this.buf.length) {
          end = this.buf.length - offset;
        }
        const buf = Buffer.alloc(end * 4);
        const dst = new Int16Array(buf.buffer);
        for (let i = 0; i < end; ++i) {
          const elem = this.buf[i + offset];
          dst[i * 2] = elem;
          dst[i * 2 + 1] = elem;
        }
        this.push(buf);
        this.pos += end;
        if (this.pos == this.buf.length) {
          this.buf = null;
          this.push(null);
        }
      }
      _destroy() {
        this.wave_p = Promise.resolve(false);
      }
    }
    const wav = new Promise((resolve, reject) => {
      try {
        this.speak(text, options).then(buffer => {
          const wave = {
            raw_data: buffer,
            data: new Int16Array(buffer.buffer),
            bitDepth: 16,
            numChannels: 1,
            sampleRate:48000
          };
          resolve(wave);
        });
      } catch (err) {
        reject(err);
      }
    });
    // const buf = await this.speak(text, options);
    const stream = new SynthesizedSoundStream(wav);
    return stream;
  }
}

module.exports = { OpenJTalk, HtsvoiceFiles };

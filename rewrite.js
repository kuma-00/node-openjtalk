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
  TOHOKU_NEUTRAL: path.join(__dirname, "/voice/htsvoice-tohoku-f01-master/tohoku-f01-neutral.htsvoice"),
  TOHOKU_SAD: path.join(__dirname, "/voice/htsvoice-tohoku-f01-master/tohoku-f01-sad.htsvoice"),
  TAKUMI_ANGRY: path.join(__dirname, "/voice/takumi/takumi_angry.htsvoice"),
  TAKUMI_HAPPY: path.join(__dirname, "/voice/takumi/takumi_happy.htsvoice"),
  TAKUMI_NORMAL: path.join(__dirname, "/voice/takumi/takumi_normal.htsvoice"),
  TAKUMI_SAD: path.join(__dirname, "/voice/takumi/takumi_sad.htsvoice")
}

class OpenJTalk {
  constructor(options) {
    Object.assign(this, DefaultOptions, options)
  }

  async speak(text, options) {
    text = text.replace(/;|:/, "");
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
      s: this.sampling_rate,
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
    const buf = await this.speak(text, options);
    const stream = new Readable({
      read() {
        this.push(buf);
        this.push(null);
      }
    });
    
    return stream;
  }
}

module.exports = { OpenJTalk, HtsvoiceFiles };

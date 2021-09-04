const OpenJTalk = require('../../rewrite.js');
const mei1 = new OpenJTalk(); // mei_normal を使用
const mei2 = new OpenJTalk({ htsvoice: './voice/mei/mei_angry.htsvoice' });
const mei3 = new OpenJTalk({ htsvoice: './voice/mei/mei_happy.htsvoice' });

(async () => {
  const result = await mei1.speak("これはテストです。");
  console.log(result);
  console.log(await mei1.speakStream("これはテストです。"));
})();

/*
mei1.talk('これはテストです'); // コールバックは省略できる
setTimeout(function() {
	mei2.talk('喋り終わり次第コールバックを呼びます', function(err) {
		if (err) console.log('err', err);
		console.log('コールバックを呼ぶ');
		mei3.talk('エラーが発生したらコールバックの引数からチェックできます', function(err) {
			if (err) console.log('err', err);
			else mei1.talk('エラーは発生しませんでした');
		});
	});
}, 2000);
*/
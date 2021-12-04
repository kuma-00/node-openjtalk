const {OpenJTalk,HtsvoiceFiles} = require('../../rewrite.js');
const mei1 = new OpenJTalk(); // mei_normal を使用
const mei2 = new OpenJTalk({ htsvoice: './voice/mei/mei_angry.htsvoice' });
const mei3 = new OpenJTalk({ htsvoice: './voice/mei/mei_happy.htsvoice' });

(async () => {
  console.log(HtsvoiceFiles);
  const result = await mei1.speak("これはテストです。");
  console.log(result);
  console.log(await mei1.speakStream("これはテストです。"));
	console.log("all hts file check");
	for await(const [key,htsvoice] of Object.entries(HtsvoiceFiles)){
		const ojt = new OpenJTalk({htsvoice});
		const res = await ojt.speak("test");
		console.log(key,res.length);
	}
	console.log("all hts file ok!");
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
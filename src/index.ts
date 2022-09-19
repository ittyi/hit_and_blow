const modes = ['normal', 'hard'] as const;
type Mode = typeof modes[number];

const printLine = (text: string, breakLine: boolean = true) => {
	return process.stdout.write(text + (breakLine ? `\n`: ''))
}

const promptInput = async (text: string) => {
	printLine(`\n${text}\n`, false);
	return readLine();
}

const readLine = async () => {
	const input: string = await new Promise(
		(resolve) => process.stdin.once(
			'data',
			(data) => resolve(data.toString()) 
		)
	)
	return input.trim()
}

const promptSelect = async <T extends string>(text: string, values: readonly T[]): Promise<T> => {
	printLine(`\n${text}`);
	values.forEach((value) => {
		printLine(`- ${value}`);
	})

	printLine(`> `, false);

	const input = await readLine() as T;
	if (values.includes(input)) {
		return input;
	} else {
		return promptSelect<T>(text, values);
	}
}


/* main class */
class HitAndBlow {
	private readonly answerSource: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	private answer: string[] = [];
	private tryCount: number = 0;
	private mode: Mode = 'normal';

	private getAnswerLength() {
		switch (this.mode) {
			case 'normal':
				return 3;
			case 'hard':
				return 4;
			default :
				const neverVal: never = this.mode;
				throw new Error(`${neverVal} は無効なモードです。`)
		}
	}

	async setting() {
		this.mode = await promptSelect<Mode>('モードを入力してください。', modes);
		while (this.answer.length < this.getAnswerLength()) {
			const randumNum = String(Math.floor( Math.random() * this.answerSource.length));
			if ((this.answer).includes(randumNum) == false) {
				this.answer.push(randumNum);
			}
		}
		// console.log('answer:', this.answer);
	}

	private checkInputStr(inputNumStr: string[]) {
		if (inputNumStr.length != this.answer.length) {
			return false;
		}

		let checkErrerFlg = true;
		inputNumStr.forEach(element => {
			if (this.answerSource.includes(element) == false) {
				checkErrerFlg = false;
			}
			
			/// 配列中で inputNumStr[i] が最初/最後に出てくる位置を取得
			let firstIndex = inputNumStr.indexOf(element);
			let lastIndex = inputNumStr.lastIndexOf(element);

			if(firstIndex != lastIndex){
				checkErrerFlg = false;
			}
		});
		return checkErrerFlg;
	}

	async play() {
		let inputNumStr = (await promptInput(`「,」区切りで${this.getAnswerLength()}つの数字を入力してください`)).split(',');
		while (this.checkInputStr(inputNumStr) == false) {
			printLine('無効な入力です。')
			inputNumStr = (await promptInput(`「,」区切りで${this.getAnswerLength()}つの数字を入力してください`)).split(',');
		}

		const inputArr = inputNumStr;
		const result = this.check(inputArr);
		console.log(inputArr)
		console.log(result)

		if (result.hit >= this.answer.length) {
			this.tryCount += 1;
		} else {
			this.tryCount += 1;
			console.log('one more!', result)
			await this.play();
		}
	}

	private check(input: string[]) {
		let hitCount = 0;
		let blowCount = 0;

		input.forEach((inputVal, index)=> {
			if (inputVal == this.answer[index]) {
				hitCount += 1;
			} else if (this.answer.includes(inputVal)) {
				blowCount += 1;
			}
		});

		return {
			hit: hitCount,
			blow: blowCount
		};
	}

	end() {
		printLine(`conglutts!! Trial Count: ${this.tryCount}`);
		process.exit();
	}
}

// exec process
;(
	async function () {
		const hitAndBlow = new HitAndBlow();
		await hitAndBlow.setting();
		await hitAndBlow.play();
		hitAndBlow.end();
	}
)();


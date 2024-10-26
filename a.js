class Traffic {
	constructor(initialSignal, trafficLightController) {
		this.currentSignal = initialSignal;
		this.queue = {
			FORWARD: [],
			LEFT: [],
			RIGHT: []
		}; // Очередь для каждого направления

		// Подписываемся на изменения сигнала
		trafficLightController.subscribe((newSignal) => {
			this.currentSignal = newSignal;
			this.processQueue();
		});
	}

	// Проверяем, соответствует ли сигнал разрешению на движение
	isValidSignal(direction) {
		switch (direction) {
			case 'FORWARD':
				return this.currentSignal === 'GREEN';
			case 'LEFT':
				return this.currentSignal === 'LEFT';
			case 'RIGHT':
				return this.currentSignal === 'RIGHT';
			default:
				return false;
		}
	}

	// Основной метод для обработки запроса на движение
	async go(direction) {
		if (this.isValidSignal(direction)) {
			// Если сигнал разрешает движение, гондольер едет сразу
			return Promise.resolve();
		}

		// Иначе добавляем гондольера в очередь ожидания
		return new Promise((resolve) => {
			this.queue[direction].push(resolve);
		});
	}

	// Обрабатываем очередь гондольеров для текущего сигнала
	processQueue() {
		const directionsToProcess = {
			GREEN: 'FORWARD',
			LEFT: 'LEFT',
			RIGHT: 'RIGHT'
		};

		const currentDirection = directionsToProcess[this.currentSignal];

		// Если есть ожидающие гондольеры в направлении текущего сигнала
		if (currentDirection && this.queue[currentDirection].length > 0) {
			// Разрешаем всем гондольерам этого направления начать движение
			while (this.queue[currentDirection].length > 0) {
				const resolve = this.queue[currentDirection].shift();
				resolve(); // Разрешаем движение
			}
		}
	}
}

module.exports = { Traffic };

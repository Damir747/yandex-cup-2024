module.exports = function (maps) {
	const pages = []; // массив для хранения страниц

	// Функция для проверки пересечения двух прямоугольников
	const doIntersect = (rect1, rect2) => {
		return !(rect2[0] > rect1[2] || rect2[1] > rect1[3] || rect2[2] < rect1[0] || rect2[3] < rect1[1]);
	};

	// Функция для проверки, помещается ли один прямоугольник в другой
	const isContained = (container, candidate) => {
		return (
			candidate[0] >= container[0] &&
			candidate[1] >= container[1] &&
			candidate[2] <= container[2] &&
			candidate[3] <= container[3]
		);
	};

	// Функция для объединения нескольких прямоугольников
	const mergeRects = (...rects) => {
		const x1 = Math.min(...rects.map(rect => Math.min(rect[0], rect[2])));
		const y1 = Math.min(...rects.map(rect => Math.min(rect[1], rect[3])));
		const x2 = Math.max(...rects.map(rect => Math.max(rect[0], rect[2])));
		const y2 = Math.max(...rects.map(rect => Math.max(rect[1], rect[3])));
		return [x1, y1, x2, y2];
	};

	const visited = Array(maps.length).fill(false); // массив для отслеживания обработанных карт

	const normalizeMap = (map) => {
		return [
			Math.min(map[0], map[2]), // x1
			Math.min(map[1], map[3]), // y1
			Math.max(map[0], map[2]), // x2
			Math.max(map[1], map[3]), // y2
		];
	};

	for (let i = 0; i < maps.length; i++) {
		if (visited[i]) continue; // если карта уже обработана, пропускаем её

		const normalizedMap = normalizeMap(maps[i]); // нормализуем текущую карту
		let addedToPage = false; // флаг для проверки, добавлен ли прямоугольник на страницу

		for (let page of pages) {
			// Проверяем, пересекается ли текущая карта с уже существующими прямоугольниками на странице
			for (let index of page.indexes) {
				const existingMap = normalizeMap(maps[index]);
				if (doIntersect(existingMap, normalizedMap) || isContained(existingMap, normalizedMap)) {
					// Если пересекается или помещается в существующий прямоугольник, обновляем страницу
					page.box = mergeRects(page.box, normalizedMap);
					page.indexes.push(i); // добавляем индекс карты в существующую страницу
					visited[i] = true; // отмечаем карту как обработанную
					addedToPage = true; // устанавливаем флаг
					break;
				}
			}
			if (addedToPage) break; // выходим, если добавили карту на страницу
		}

		if (!addedToPage) {
			// Если не удалось добавить карту на существующую страницу, создаём новую
			pages.push({
				box: normalizedMap,
				indexes: [i],
			});
			visited[i] = true; // отмечаем карту как обработанную
		}
	}

	return pages;
};


// Пример использования
const maps = [
	[4, 4, 8, 8],
	[6, 6, 10, 10],
	[4, 9, 5, 15],
];

console.log(module.exports(maps));

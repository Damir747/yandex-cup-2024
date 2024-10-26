// solution.js
export function compress(text) {
	const lines = text.split('\n');
	const map = new Map();

	// Сохраняем уникальные строки
	for (const line of lines) {
		if (!map.has(line)) {
			map.set(line, map.size);
		}
	}

	const uniqueEntries = Array.from(map.keys());
	const compressedData = new Uint8Array(lines.length);

	// Заполняем массив индексами для каждой строки
	for (let i = 0; i < lines.length; i++) {
		compressedData[i] = map.get(lines[i]);
	}

	return compressedData.buffer;
}

export function decompress(buffer) {
	const compressedData = new Uint8Array(buffer);
	const uniqueEntries = [];

	// Восстанавливаем уникальные строки по индексам
	compressedData.forEach(index => {
		if (uniqueEntries[index] === undefined) {
			uniqueEntries[index] = index.toString(); // создаем строку по индексу
		}
	});

	return uniqueEntries.join('\n');
}

const createSelector = (selector) => {
	return (state, params) => {
		const steps = []; // Массив для хранения шагов
		const visited = new Set(); // Множество для отслеживания посещенных путей

		// Вспомогательная функция для создания Proxy, чтобы отслеживать доступ
		const createTrackingProxy = (obj, pathPrefix) => {
			return new Proxy(obj, {
				get(target, prop) {
					// Игнорируем случай обращения к символам вроде Symbol.iterator
					if (typeof prop === 'symbol') {
						return target[prop];
					}

					const path = [...pathPrefix, String(prop)]; // Добавляем текущий шаг
					const value = target[prop];

					// Проверяем, было ли это свойство уже посещено
					if (!visited.has(path.join('.'))) {
						visited.add(path.join('.')); // Добавляем путь в посещенные

						// Если это объект или массив, продолжаем отслеживать глубже
						if (value && typeof value === 'object') {
							const deeperProxy = createTrackingProxy(value, path);

							// Проверяем, было ли это свойство запрошено
							if (prop !== 'inner') {
								steps.push(path); // Сохраняем шаг в массив только если это не 'inner'
							}

							return deeperProxy;
						} else {
							// Сохраняем шаг только для конечных значений
							if (path.length > 1 || (path.length === 1 && value !== undefined)) {
								steps.push(path);
							}
						}
					}

					// Возвращаем значение (не объект)
					return value;
				}
			});
		};

		// Создаем Proxy для аргумента state и params
		const proxyState = createTrackingProxy(state, ['arg0']);
		const proxyParams = params ? createTrackingProxy(params, ['arg1']) : undefined;

		// Вызываем селектор с proxy вместо оригинальных объектов
		const result = selector(proxyState, proxyParams);

		return { result, steps }; // Возвращаем результат и шаги
	};
};
module.exports = createSelector;

const selector1 = createSelector((state) => {
	if (state.isEnabled) {
		return state.inner.value;
	}
	return null;
});

const selector2 = createSelector((state) => {
	if (Array.isArray(state.array) && state.array.length > 0) {
		return state.array[0];
	}
	return null;
});

const selector3 = createSelector((state, params) => {
	if (params && params.short) {
		return {
			id: state.id,
			name: state.name,
		};
	}
	return state;
});

// Тесты
const result1 = selector1({ isEnabled: true, inner: { value: 42 } });
const result2 = selector1({ isEnabled: false, inner: { value: 21 } });
const result3 = selector2({ array: [1, 2, 3] });
const result4 = selector3({ id: 2135, name: "Ivan", lastname: "Ivanov", age: 25 }, { short: false });

const obj1 = {
	result: 42,
	steps: [
		["arg0", "isEnabled"],
		["arg0", "inner", "value"],
	],
};

const obj2 = {
	result: null,
	steps: [["arg0", "isEnabled"]],
};

const obj3 = {
	result: 1,
	steps: [
		["arg0", "array"],
		["arg0", "array", "length"],
		["arg0", "array", "0"]
	],
};

const obj4 = {
	result: {
		id: 2135,
		name: "Ivan",
		lastname: "Ivanov",
		age: 25
	},
	steps: [
		["arg1", "short"],
		["arg0"]
	]
};

console.log(JSON.stringify(result1));
console.log(JSON.stringify(obj1));
console.log(JSON.stringify(result1) === JSON.stringify(obj1)); // true
console.log(JSON.stringify(result2));
console.log(JSON.stringify(obj2));
console.log(JSON.stringify(result2) === JSON.stringify(obj2)); // true
console.log(JSON.stringify(result3));
console.log(JSON.stringify(obj3));
console.log(JSON.stringify(result3) === JSON.stringify(obj3)); // true
console.log(JSON.stringify(result4));
console.log(JSON.stringify(obj4));
console.log(JSON.stringify(result4) === JSON.stringify(obj4)); // true

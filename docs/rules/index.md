[< How it works](../how_it_works.md)

---

### Default Rules
These rules come out of the box and can be overwritten any time if you want.

| Rule          | Example     | OptionType    | Description    | Errors |
| ------------- | ---------   | ------------  | -------------- | -------------- |
| must        | `{must: true}`    | boolean: true | Checks if this exist or if undefined  | _:param is required._
| typeOf      | `{typeOf: 'array'}` | string           | works exactly like javascript `typeof` but uses `Array.isArray` if option is "array"| _:param is not typeOf :option_
| min      | `{min: 5}` | number/string           | value >= 5 | _:param is too small. (Min. :option)_
| max      | `{max: 10}` | number/string           | value <= 10 | _:param is too big. (Max. :option)_
| minLength      | `{min: 5}` | string/array           | value.length >= 5 | _:param is too short. (Min. :option characters)_
| maxLength      | `{max: 10}` | string/array           | value.length <= 10 | _:param is too long. (Max. :option characters)_
| selectMin      | `{selectMin: 5}` | array          | value.length >= 5 | _Select at-least :option :param._
| selectMax      | `{selectMax: 10}` | array          | value.length >= 10 | _Select at-most :option :param._



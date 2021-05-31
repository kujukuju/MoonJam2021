class InputManager {
    static keys = {};
    static mouseDownLeft = false;
    static mouseDownRight = false;
    static mousePosition = [0, 0];

    static initialize() {
        window.addEventListener('keydown', event => {
            InputManager.keys[event.key.toLowerCase()] = true;
        }, true);

        window.addEventListener('keyup', event => {
            InputManager.keys[event.key.toLowerCase()] = false;
        }, true);

        window.addEventListener('mousemove', event => {
            InputManager.mousePosition[0] = event.clientX;
            InputManager.mousePosition[1] = event.clientY;
        }, true);

        window.addEventListener('mousedown', event => {
            if (event.button === 0) {
                InputManager.mouseDownLeft = true;
            }
            if (event.button === 2) {
                InputManager.mouseDownRight = true;
            }
        }, true);
        window.addEventListener('mouseup', event => {
            if (event.button === 0) {
                InputManager.mouseDownLeft = false;
            }
            if (event.button === 2) {
                InputManager.mouseDownRight = false;
            }
        }, true);

        window.addEventListener('contextmenu', event => {
            event.preventDefault();
            return false;
        }, true);
    }

    static hasKey() {
        for (const key in InputManager.keys) {
            if (InputManager.keys[key]) {
                return true;
            }
        }

        return false;
    }
}
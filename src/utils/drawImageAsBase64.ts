export function drawImageAsBase64(width: number, height: number, color = "rgba(0, 0, 0, 0)") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (context == null) {
        throw new Error("failed to get context");
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL();
    canvas.remove();
    return base64Image;
}
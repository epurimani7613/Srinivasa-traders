# Telugu Printer Font

This folder contains the project-local Telugu font used by the ESC/POS raster print script:

- `NotoSansTelugu-Regular.otf`

Because the font travels with the project folder, the script does not depend on macOS, Android, or other system font paths.

You can replace or add another Telugu font file here, for example:

- `Gautami.ttf`
- `NotoSansTelugu-Regular.ttf`
- `Pothana.ttf`
- `Mandali-Regular.ttf`

You can also keep the font elsewhere and run:

```sh
TELUGU_FONT_PATH=/absolute/path/to/TeluguFont.ttf npm run print:telugu
```

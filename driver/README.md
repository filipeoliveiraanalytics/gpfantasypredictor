# Driver Headshots

Add cropped driver headshots here as WebP files named by driver code:

`ant.webp`, `rus.webp`, `ham.webp`, `lec.webp`, `pia.webp`, `nor.webp`, `ver.webp`, `bea.webp`, `gas.webp`, `had.webp`, `alo.webp`, `oco.webp`, `sai.webp`, `law.webp`, `bor.webp`, `hul.webp`, `bot.webp`, `str.webp`, `lin.webp`, `per.webp`, `alb.webp`, `col.webp`.

Recommended export:

- Square image, at least 256 x 256 px.
- Face centered slightly above the middle.
- Use images you have permission to publish.

If a file is missing, the website falls back to the generated illustrated portrait.

After adding image files, list the available codes in `manifest.json`, for example:

```json
{
  "photos": ["ant", "rus", "ham"]
}
```

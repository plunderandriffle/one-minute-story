<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep sample media and timed captions in a browser-safe data module, and playback and creation inputs in focused components; this keeps the landing route presentational.
- Creation is a client-side draft preview, not a video-generation service; never imply uploaded audio is transcribed or business URLs are fetched without a connected service.

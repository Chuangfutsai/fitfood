import { Component } from 'react';
import type { ReactNode } from 'react';

// Keep recovery independent of application data and the language provider.
const recoveryText = {
  'zh-Hant': {
    title: '出了點問題',
    message: '請先匯出資料備份，再重新載入試試看。',
    future:
      '這份資料來自較新的 App 版本。為了保護資料，目前不會覆寫它；' +
      '請先匯出並使用更新版本開啟。',
    reload: '重新載入',
    export: '匯出我的資料',
    failed: '無法匯出資料，請確認瀏覽器允許儲存檔案後再試一次。',
  },
  en: {
    title: 'Something Went Wrong',
    message: 'Export a copy of your data, then try reloading the app.',
    future:
      'This data was saved by a newer version of the app. It has not been overwritten.' +
      ' Export it and open it with an updated version.',
    reload: 'Reload',
    export: 'Export my data',
    failed: 'Could not export your data. Check that your browser allows file downloads and try again.',
  },
};

export async function deliverBackupFile(text: string, filename: string): Promise<boolean> {
  const file = new File([text], filename, { type: 'application/json' });
  try {
    if (typeof navigator.canShare === 'function' &&
      typeof navigator.share === 'function' &&
      navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
      return true;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return false;
    // Fall back to a download when file sharing is unavailable or rejected.
  }

  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

interface BoundaryState { error: Error | null; exportFailed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null, exportFailed: false };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { error: error instanceof Error ? error : new Error(String(error)), exportFailed: false };
  }

  private exportRaw = async () => {
    this.setState({ exportFailed: false });
    try {
      const raw = localStorage.getItem('fitfood:v1') ?? 'null';
      const now = new Date();
      let text = raw;
      try {
        const data: unknown = JSON.parse(raw);
        const version = data && typeof data === 'object' && 'version' in data ? data.version : 1;
        text = JSON.stringify({ app: 'fitfood', schemaVersion: version, exportedAt: now.toISOString(), data }, null, 2);
      } catch {
        // Export malformed JSON unchanged so it remains available for recovery.
      }
      const date =
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      await deliverBackupFile(text, `fitfood-backup-${date}.json`);
    } catch {
      this.setState({ exportFailed: true });
    }
  };

  render() {
    if (!this.state.error) return this.props.children;
    let lang: 'zh-Hant' | 'en' = 'zh-Hant';
    try {
      if (localStorage.getItem('fitfood:lang') === 'en') lang = 'en';
    } catch {
      /* Recovery also works without storage access. */
    }
    const text = recoveryText[lang];
    return (
      <main
        lang={lang}
        className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center space-y-5 px-5 py-10 text-text"
      >
        <h1 className="text-[28px] font-bold">{text.title}</h1>
        <p className="text-sm leading-6 text-muted">
          {this.state.error.name === 'UnsupportedDataVersionError' ? text.future : text.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-12 rounded-[14px] bg-food px-4 font-semibold text-white"
        >
          {text.reload}
        </button>
        <button
          type="button"
          onClick={this.exportRaw}
          className="min-h-12 rounded-[14px] border border-line bg-surface px-4 font-semibold text-food"
        >
          {text.export}
        </button>
        {this.state.exportFailed && <p role="alert" className="text-sm text-tomato-ink">{text.failed}</p>}
      </main>
    );
  }
}

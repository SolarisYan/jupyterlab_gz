import { Widget /*, PanelLayout */} from '@phosphor/widgets';

import { ABCWidgetFactory, DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

// import { CSVViewer, CSVViewerFactory } from '@jupyterlab/csvviewer';

import { gunzipSync } from 'zlib';

// const MIME_TYPE = 'application/x-gzip';

export class GzippedDocumentViewer extends Widget {
	// private _mimeType: string;
	private _contents: string;

	constructor(context: DocumentRegistry.Context) {
		super();
		console.log('constructor()');

		console.log(context);
		context.ready.then(() => {
			(window as any).context = context;
			console.log(context);
			const buf = Buffer.from(context.model.toString(), 'base64');
			this._contents = gunzipSync(buf).toString();
			console.log(this._contents);
		});
	}


}

export class GzippedDocumentViewerFactory extends ABCWidgetFactory<DocumentWidget> {
	createNewWidget(context: DocumentRegistry.Context): DocumentWidget {
		const content = new GzippedDocumentViewer(context);
		return new DocumentWidget({ content, context});
	}
}
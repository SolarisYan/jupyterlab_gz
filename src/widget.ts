import { Widget /*, PanelLayout */} from '@phosphor/widgets';

import { ABCWidgetFactory, DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

// import { CSVViewer, CSVViewerFactory } from '@jupyterlab/csvviewer';

import { gunzipSync } from 'zlib';

// const MIME_TYPE = 'application/x-gzip';

export class GzippedDocumentViewer extends Widget {
	private _mimeType: string;

	constructor(context: DocumentRegistry.Context) {
		super();
		console.log('constructor()');

		console.log(context);
		context.ready.then(() => {
			console.log(context);
			const contents = context.contentsModel;
			this._mimeType = contents.mimetype;
			console.log(this._mimeType);
			console.log(gunzipSync(context.model.toString()));
		});
	}
}

export class GzippedDocumentViewerFactory extends ABCWidgetFactory<DocumentWidget> {
	createNewWidget(context: DocumentRegistry.Context): DocumentWidget {
		const content = new GzippedDocumentViewer(context);
		return new DocumentWidget({ content, context});
	}
}
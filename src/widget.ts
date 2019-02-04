import { Widget, PanelLayout } from '@phosphor/widgets';

import { ABCWidgetFactory, DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

import { CSVViewer } from '@jupyterlab/csvviewer';

import { gunzipSync } from 'zlib';

export class GzippedDocumentWidget extends Widget {
	// private _mimeType: string;
	// private _contents: string;

	constructor(context: DocumentRegistry.Context) {
		super();
		console.log('constructor()');
		context.ready.then(() => {
			(window as any).context = context;
			const buf = Buffer.from(context.model.toString(), 'base64');
			const value = gunzipSync(buf).toString();
			context.model.fromString(value);			

		    const layout = (this.layout = new PanelLayout());
		    const viewer = new CSVViewer({ context });
		    layout.addWidget(viewer);
		});
	}
}

export class GzippedDocumentWidgetFactory extends ABCWidgetFactory<DocumentWidget> {
	createNewWidget(context: DocumentRegistry.Context): DocumentWidget {
		const content = new GzippedDocumentWidget(context);
		return new DocumentWidget({ content, context});
	}
}
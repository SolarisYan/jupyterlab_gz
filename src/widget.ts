import { BoxPanel } from '@phosphor/widgets';

import { ABCWidgetFactory, DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

import { gunzipSync } from 'zlib';

import { stripGzExtension } from './util';

const CSV_CLASS = 'jp-GZViewer';

export class GzippedDocumentWidgetFactory extends ABCWidgetFactory<DocumentWidget> {
	constructor(options: GzippedDocumentWidgetFactory.IOptions) {
		super(options);
		this._docRegistry = options.docRegistry;
	}

	createNewWidget(context: DocumentRegistry.Context): DocumentWidget {
		const path = stripGzExtension(context.path);
		console.log(`path = ${path}`);
		const factory = this._docRegistry.defaultWidgetFactory(path);

		return new GzippedDocumentWidget(context, factory);
	}

	private _docRegistry: DocumentRegistry;
}

export namespace GzippedDocumentWidgetFactory {
	export interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
		docRegistry: DocumentRegistry
	}
}

export class GzippedDocumentWidget extends DocumentWidget {
	constructor(context: DocumentRegistry.Context, factory: DocumentRegistry.WidgetFactory) {
		const content = new GzippedDocumentViewer();
		super({ content, context });

		this.addClass(CSV_CLASS);
		(window as any).gz = this;

		context.ready.then(() => {
			(window as any).context = context;

			const buf = Buffer.from(context.model.toString(), 'base64');
			context.model.fromString(gunzipSync(buf).toString());	
			context.model.dirty = false;

			content.setViewer(context, factory);
		});
	}
}

export class GzippedDocumentViewer extends BoxPanel {
	constructor() {
		super();
	}

	setViewer(context: DocumentRegistry.Context, factory: DocumentRegistry.WidgetFactory) {
		const viewer = factory.createNew(context);
		this.addWidget(viewer);
	}
}


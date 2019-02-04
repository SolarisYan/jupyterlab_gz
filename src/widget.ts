import { Widget, BoxPanel, BoxLayout } from '@phosphor/widgets';

import { ABCWidgetFactory, DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

import { gunzipSync } from 'zlib';

const CSV_CLASS_WIDGET = 'jp-GZWidget';

const CSV_CLASS_VIEWER = 'jp-GZViewer'

/**
 * Strips '.gz' from the path to transform 'foo.csv.gz' to 'foo.csv'
 */
function stripGzExtension(path: string): string {
	return path.replace(/\.gz$/, '');
}

/**
 * Widget Factory.
 * Needs DocumentRegistry for determining second widget factory from gzipped file.
 */
export class GzippedDocumentWidgetFactory extends ABCWidgetFactory<DocumentWidget> {
	constructor(options: GzippedDocumentWidgetFactory.IOptions) {
		super(options);
		this._docRegistry = options.docRegistry;
	}

	createNewWidget(context: DocumentRegistry.Context): DocumentWidget {
		const path = stripGzExtension(context.path);
		const factory = this._docRegistry.defaultWidgetFactory(path);
		const types = this._docRegistry.getFileTypesForPath(path);
		return new GzippedDocumentWidget(context, factory, types.length > 0 ? types[0] : null);
	}

	/**
	 * Document Registry instance
	 */
	private _docRegistry: DocumentRegistry;
}

/**
 * Namespace for GzippedDocumentWidgetFactory
 */
export namespace GzippedDocumentWidgetFactory {

	/**
	 * Instantiation option for widget factory
	 */
	export interface IOptions extends DocumentRegistry.IWidgetFactoryOptions {
		/**
		 * DocumentRegistry instance
		 */
		docRegistry: DocumentRegistry
	}
}

/**
 * DocumentWidget for Gzipped Document.
 * Replaces its content with appropriate document widget when the context becomes ready.
 */
export class GzippedDocumentWidget extends DocumentWidget<DocumentWidget> {
	constructor(
		context: DocumentRegistry.Context, 
		factory: DocumentRegistry.WidgetFactory,
		fileType: DocumentRegistry.IFileType | null) {
		// add dummy content
		super({ content: new Widget(), context });
		// remove default toolbar as the viewer widget will have another
		this.layout.removeWidget(this.toolbar);

		this.addClass(CSV_CLASS_WIDGET);
		this.title.iconClass = fileType.iconClass;
		this.title.iconLabel = fileType.iconLabel;

		context.ready.then(() => {
			// replace context's model after decoding BASE64 and gzip
			const buf = Buffer.from(context.model.toString(), 'base64');
			context.model.fromString(gunzipSync(buf).toString());
			// disable autosave
			context.model.dirty = false;

			// replace content
			const content = factory.createNew(context);
			this.layout.removeWidget(this.content);
			(this.layout as BoxLayout).addWidget(content);
		});
	}
}

import { BoxPanel } from '@phosphor/widgets';

import { ABCWidgetFactory, DocumentWidget, DocumentRegistry } from '@jupyterlab/docregistry';

import { gunzipSync } from 'zlib';

const CSV_CLASS = 'jp-GZViewer';

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
 * Holds GzippedDocumentViewer as its sole child.
 */
export class GzippedDocumentWidget extends DocumentWidget {
	constructor(
		context: DocumentRegistry.Context, 
		factory: DocumentRegistry.WidgetFactory,
		fileType: DocumentRegistry.IFileType | null) {
		const content = new GzippedDocumentViewer();
		super({ content, context });

		this.addClass(CSV_CLASS);
		this.title.iconClass = fileType.iconClass;
		this.title.iconLabel = fileType.iconLabel;

		context.ready.then(() => {
			// decode BASE64 and gzip
			const buf = Buffer.from(context.model.toString(), 'base64');
			context.model.fromString(gunzipSync(buf).toString());
			// disable autosave
			context.model.dirty = false;

			content.setViewer(context, factory);
		});
	}
}

/**
 * Viewer for Gzipped file.
 */
export class GzippedDocumentViewer extends BoxPanel {
	constructor() {
		super();
	}

	/**
	 * Instantiates viewer widget using the given factory
	 */
	setViewer(context: DocumentRegistry.Context, factory: DocumentRegistry.WidgetFactory) {
		const viewer = factory.createNew(context);
		this.addWidget(viewer);
	}
}


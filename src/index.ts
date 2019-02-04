import { JupyterLab, JupyterLabPlugin, ILayoutRestorer } from '@jupyterlab/application';

import { InstanceTracker } from '@jupyterlab/apputils';

import { IDocumentWidget } from '@jupyterlab/docregistry';

// import { IMainMenu } from '@jupyterlab/mainmenu';

import { GzippedDocumentWidgetFactory } from './widget';

import '../style/index.css';

const FACTORY_GZ = 'gz';

const MIME_TYPE = 'application/gzip';

function activate(app: JupyterLab, restorer: ILayoutRestorer): void {
    console.log('JupyterLab extension jupyterlab_gz is activated!');
    (window as any).app = app;

    app.docRegistry.addFileType({
      name: 'gz',
      displayName: 'Gzip',
      fileFormat: 'base64',
      mimeTypes: [MIME_TYPE],
      extensions: ['.gz']
    });
    
    const factory = new GzippedDocumentWidgetFactory({
      name: FACTORY_GZ,
      modelName: 'base64',
      fileTypes: ['gz'],
      defaultFor: ['gz'],
      readOnly: true
    });

    app.docRegistry.addWidgetFactory(factory);

    const tracker = new InstanceTracker<IDocumentWidget>({
      namespace: 'gzviewer'
    });

    restorer.restore(tracker, {
      command: 'docmanager:open',
      args: widget => ({ path: widget.context.path, factory: FACTORY_GZ }),
      name: widget => widget.context.path
    });

    let id = 0;
    factory.widgetCreated.connect((sender, widget) => {
      console.log('widgetCreated()');

      widget.context.pathChanged.connect(() => {
        tracker.save(widget);
      });
      widget.id = widget.id || `gz-${++id}`;

      tracker.add(widget);
    })
}

/**
 * Initialization data for the jupyterlab_csvgz extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_gz',
  autoStart: true,
  activate: activate,
  requires: [ILayoutRestorer]
};

export default extension;

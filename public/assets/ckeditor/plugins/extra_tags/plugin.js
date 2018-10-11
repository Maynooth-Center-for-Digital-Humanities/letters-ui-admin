CKEDITOR.plugins.add( 'extra_tags', {
    icons: 'address',
    hidpi: true,
    init: function( editor ) {
  		var order = 0;
      var addButtonCommand = function( buttonName, buttonLabel, commandName, styleDefiniton ) {
          // Disable the command if no definition is configured.
          if ( !styleDefiniton )
            return;

          var style = new CKEDITOR.style( styleDefiniton ),
            forms = contentForms[ commandName ];

          // Put the style as the most important form.
          forms.unshift( style );

          // Listen to contextual style activation.
          editor.attachStyleStateChange( style, function( state ) {
            !editor.readOnly && editor.getCommand( commandName ).setState( state );
          } );

          // Create the command that can be used to apply the style.
          editor.addCommand( commandName, new CKEDITOR.styleCommand( style, {
            contentForms: forms
          } ) );

          // Register the button, if the button plugin is loaded.
          if ( editor.ui.addButton ) {
            editor.ui.addButton( buttonName, {
              label: buttonLabel,
              command: commandName,
              toolbar: 'basicstyles,' + ( order += 10 )
            } );
          }
        };

      var contentForms = {
  				address: [
  					'address',
  				],
        },
  			config = editor.config;
      addButtonCommand( 'Address', 'Address', 'address', config.coreStyles_address );
    }
});

CKEDITOR.config.coreStyles_address = { element: 'address' };

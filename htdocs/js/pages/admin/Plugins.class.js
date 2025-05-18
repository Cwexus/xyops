// Admin Page -- Plugins Config

Page.Plugins = class Plugins extends Page.PageUtils {
	
	onInit() {
		// called once at page load
		this.default_sub = 'list';
		this.dom_prefix = 'ep';
		this.ctype_labels = {
			text: "Text Field",
			textarea: "Text Box",
			code: "Code Editor",
			checkbox: "Checkbox",
			select: "Menu",
			hidden: "Hidden"
		};
		this.ctype_icons = {
			text: "form-textbox",
			textarea: "form-textarea",
			code: "code-json",
			checkbox: "checkbox-marked-outline",
			select: "form-dropdown",
			hidden: "eye-off-outline"
		};
	}
	
	onActivate(args) {
		// page activation
		if (!this.requireLogin(args)) return true;
		if (!this.requireAnyPrivilege('create_plugins', 'edit_plugins', 'delete_plugins')) return true;
		
		if (!args) args = {};
		if (!args.sub) args.sub = this.default_sub;
		this.args = args;
		
		app.showSidebar(true);
		
		this.loading();
		this['gosub_'+args.sub](args);
		
		return true;
	}
	
	gosub_list(args) {
		// show plugin list
		app.setWindowTitle( "Plugins" );
		app.setHeaderTitle( '<i class="mdi mdi-power-plug">&nbsp;</i>Plugins' );
		
		// this.loading();
		// app.api.post( 'app/get_plugins', copy_object(args), this.receive_plugins.bind(this) );
		
		// use plugins in app cache
		this.receive_plugins({
			code: 0,
			rows: app.plugins,
			list: { length: app.plugins.length }
		});
	}
	
	receive_plugins(resp) {
		// receive all plugins from server, render them sorted
		var self = this;
		var html = '';
		
		if (!resp.rows) resp.rows = [];
		this.plugins = resp.rows;
		
		// NOTE: Don't change these columns without also changing the responsive css column collapse rules in style.css
		var cols = ['<i class="mdi mdi-checkbox-marked-outline"></i>', 'Plugin Title', 'Plugin ID', 'Type', 'Author', 'Created', 'Actions'];
		
		html += '<div class="box">';
		html += '<div class="box_title">';
			html += 'Plugins';
		html += '</div>';
		html += '<div class="box_content table">';
		
		var grid_opts = {
			rows: this.plugins,
			cols: cols,
			data_type: 'plugin',
			grid_template_columns: 'min-content' + ' auto'.repeat( cols.length - 1 )
		};
		
		html += this.getBasicGrid( grid_opts, function(item, idx) {
			var actions = [];
			if (app.hasPrivilege('edit_plugins')) actions.push( '<span class="link" onClick="$P().edit_plugin('+idx+')"><b>Edit</b></span>' );
			if (app.hasPrivilege('delete_plugins')) actions.push( '<span class="link danger" onClick="$P().delete_plugin('+idx+')"><b>Delete</b></span>' );
			
			var plugin_events = find_objects( app.events, { plugin: item.id } );
			var num_events = plugin_events.length;
			
			var tds = [
				'<div class="td_drag_handle" style="cursor:default">' + self.getFormCheckbox({
					checked: item.enabled,
					onChange: '$P().toggle_plugin_enabled(this,' + idx + ')'
				}) + '</div>',
				'<b>' + self.getNicePlugin(item, app.hasPrivilege('edit_plugins')) + '</b>',
				'<span class="mono">' + item.id + '</span>',
				self.getNicePluginType(item.type),
				// commify( num_events ),
				self.getNiceUser(item.username, app.isAdmin()),
				'<span title="'+self.getNiceDateTimeText(item.created)+'">'+self.getNiceDate(item.created)+'</span>',
				actions.join(' | ')
			];
			
			if (!item.enabled) tds.className = 'disabled';
			return tds;
		} ); // getBasicGrid
		
		html += '</div>'; // box_content
		
		html += '<div class="box_buttons">';
			if (app.hasAnyPrivilege('create_plugins', 'edit_plugins')) html += '<div class="button" onClick="$P().doFileImportPrompt()"><i class="mdi mdi-cloud-upload-outline">&nbsp;</i>Import File...</div>';
			html += '<div class="button secondary" onClick="$P().go_history()"><i class="mdi mdi-history">&nbsp;</i>Revision History...</div>';
			if (app.hasPrivilege('create_plugins')) html += '<div class="button default" onClick="$P().edit_plugin(-1)"><i class="mdi mdi-plus-circle-outline">&nbsp;</i>New Plugin...</div>';
		html += '</div>'; // box_buttons
		
		html += '</div>'; // box
		
		this.div.html( html );
		this.setupBoxButtonFloater();
	}
	
	toggle_plugin_enabled(elem, idx) {
		// toggle plugin checkbox, actually do the enable/disable here, update row
		var self = this;
		var item = this.plugins[idx];
		
		if (config.alt_to_toggle && !app.lastClick.altKey) {
			$(elem).prop('checked', !$(elem).is(':checked'));
			return app.showMessage('warning', "Accidental Click Protection: Please hold the Alt/Opt key to toggle this checkbox.", 8);
		}
		
		item.enabled = !!$(elem).is(':checked');
		
		app.api.post( 'app/update_plugin', item, function(resp) {
			if (!self.active) return; // sanity
			
			if (item.enabled) $(elem).closest('ul').removeClass('disabled');
			else $(elem).closest('ul').addClass('disabled');
		} );
	}
	
	edit_plugin(idx) {
		// jump to edit sub
		if (idx > -1) Nav.go( '#Plugins?sub=edit&id=' + this.plugins[idx].id );
		else Nav.go( '#Plugins?sub=new' );
	}
	
	delete_plugin(idx) {
		// delete plugin from search results
		this.plugin = this.plugins[idx];
		this.show_delete_plugin_dialog();
	}
	
	go_history() {
		Nav.go( '#Plugins?sub=history' );
	}
	
	gosub_history(args) {
		// show revision history sub-page
		app.setHeaderNav([
			{ icon: 'power-plug', loc: '#Plugins?sub=list', title: 'Plugins' },
			{ icon: 'history', title: "Revision History" }
		]);
		app.setWindowTitle( "Plugin Revision History" );
		
		this.goRevisionHistory({
			activityType: 'plugins',
			itemKey: 'plugin',
			editPageID: 'Plugins',
			itemMenu: {
				label: '<i class="icon mdi mdi-power-plug">&nbsp;</i>Plugin:',
				title: 'Select Plugin',
				options: [['', 'Any Plugin']].concat( app.plugins ),
				default_icon: 'power-plug-outline'
			}
		});
	}
	
	gosub_new(args) {
		// create new plugin
		var html = '';
		app.setWindowTitle( "New Plugin" );
		
		app.setHeaderNav([
			{ icon: 'power-plug', loc: '#Plugins?sub=list', title: 'Plugins' },
			{ icon: 'power-plug-outline', title: "New Plugin" }
		]);
		
		html += '<div class="box">';
		html += '<div class="box_title">';
			html += 'New Plugin';
			html += '<div class="box_subtitle"><a href="#Plugins?sub=list">&laquo; Back to Plugin List</a></div>';
		html += '</div>';
		html += '<div class="box_content">';
		
		this.plugin = {
			"id": "",
			"title": "",
			"enabled": true,
			"type": "event",
			"command": "",
			"script": "",
			"groups": [],
			"format": "text",
			"params": [],
			"notes": ""
		};
		this.params = this.plugin.params;
		
		html += this.get_plugin_edit_html();
		
		html += '</div>'; // box_content
		
		// buttons at bottom
		html += '<div class="box_buttons">';
			html += '<div class="button" onClick="$P().cancel_plugin_edit()"><i class="mdi mdi-close-circle-outline">&nbsp;</i>Cancel</div>';
			html += '<div class="button secondary" onClick="$P().do_export()"><i class="mdi mdi-cloud-download-outline">&nbsp;</i><span>Export...</span></div>';
			html += '<div class="button primary" onClick="$P().do_new_plugin()"><i class="mdi mdi-floppy">&nbsp;</i>Create Plugin</div>';
		html += '</div>'; // box_buttons
		
		html += '</div>'; // box
		
		this.div.html( html );
		
		SingleSelect.init( this.div.find('#fe_ep_icon, #fe_ep_type, #fe_ep_format') );
		MultiSelect.init( this.div.find('select[multiple]') );
		// this.updateAddRemoveMe('#fe_ep_email');
		$('#fe_ep_title').focus();
		this.setPluginType();
		this.setupBoxButtonFloater();
		this.setupEditor();
		
		this.setupDraggableGrid({
			table_sel: this.div.find('div.data_grid'), 
			handle_sel: 'div.td_drag_handle', 
			drag_ghost_sel: 'div:nth-child(2)', 
			drag_ghost_x: 5, 
			drag_ghost_y: 10, 
			callback: this.moveParam.bind(this)
		});
	}
	
	cancel_plugin_edit() {
		// cancel editing plugin and return to list
		Nav.go( '#Plugins?sub=list' );
	}
	
	do_new_plugin(force) {
		// create new plugin
		app.clearError();
		var plugin = this.get_plugin_form_json();
		if (!plugin) return; // error
		
		this.plugin = plugin;
		
		Dialog.showProgress( 1.0, "Creating Plugin..." );
		app.api.post( 'app/create_plugin', plugin, this.new_plugin_finish.bind(this) );
	}
	
	new_plugin_finish(resp) {
		// new plugin created successfully
		Dialog.hideProgress();
		if (!this.active) return; // sanity
		
		Nav.go('Plugins?sub=list');
		app.showMessage('success', "The new plugin was created successfully.");
	}
	
	gosub_edit(args) {
		// edit plugin subpage
		this.loading();
		app.api.post( 'app/get_plugin', { id: args.id }, this.receive_plugin.bind(this), this.fullPageError.bind(this) );
	}
	
	receive_plugin(resp) {
		// edit existing plugin
		var html = '';
		if (!this.active) return; // sanity
		
		if (this.args.rollback && this.rollbackData) {
			resp.plugin = this.rollbackData;
			delete this.rollbackData;
			app.showMessage('info', `Revision ${resp.plugin.revision} has been loaded as a draft edit.  Click 'Save Changes' to complete the rollback.  Note that a new revision number will be assigned.`);
		}
		
		this.plugin = resp.plugin;
		if (!this.plugin.params) this.plugin.params = [];
		this.params = this.plugin.params;
		
		app.setWindowTitle( "Editing Plugin \"" + (this.plugin.title) + "\"" );
		
		app.setHeaderNav([
			{ icon: 'power-plug', loc: '#Plugins?sub=list', title: 'Plugins' },
			{ icon: this.plugin.icon || 'power-plug-outline', title: this.plugin.title }
		]);
		
		html += '<div class="box">';
		html += '<div class="box_title">';
			html += 'Edit Plugin Details';
			html += '<div class="box_subtitle"><a href="#Plugins?sub=list">&laquo; Back to Plugin List</a></div>';
		html += '</div>';
		html += '<div class="box_content">';
		
		html += this.get_plugin_edit_html();
		
		html += '</div>'; // box_content
		
		// buttons at bottom
		html += '<div class="box_buttons">';
			html += '<div class="button mobile_collapse" onClick="$P().cancel_plugin_edit()"><i class="mdi mdi-close-circle-outline">&nbsp;</i><span>Cancel</span></div>';
			html += '<div class="button danger mobile_collapse" onClick="$P().show_delete_plugin_dialog()"><i class="mdi mdi-trash-can-outline">&nbsp;</i><span>Delete...</span></div>';
			html += '<div class="button secondary mobile_collapse" onClick="$P().do_export()"><i class="mdi mdi-cloud-download-outline">&nbsp;</i><span>Export...</span></div>';
			html += '<div class="button secondary mobile_collapse" onClick="$P().go_edit_history()"><i class="mdi mdi-history">&nbsp;</i><span>History...</span></div>';
			html += '<div class="button primary" onClick="$P().do_save_plugin()"><i class="mdi mdi-floppy">&nbsp;</i>Save Changes</div>';
		html += '</div>'; // box_buttons
		
		html += '</div>'; // box
		
		this.div.html( html );
		
		// lock ID for editing
		$('#fe_ep_id').attr('disabled', true);
		SingleSelect.init( this.div.find('#fe_ep_icon, #fe_ep_type, #fe_ep_format') );
		MultiSelect.init( this.div.find('select[multiple]') );
		// this.updateAddRemoveMe('#fe_ep_email');
		this.setPluginType();
		this.setDefaultEditorMode();
		this.setupEditor();
		this.setupBoxButtonFloater();
		
		this.setupDraggableGrid({
			table_sel: this.div.find('div.data_grid'), 
			handle_sel: 'div.td_drag_handle', 
			drag_ghost_sel: 'div:nth-child(2)', 
			drag_ghost_x: 5, 
			drag_ghost_y: 10, 
			callback: this.moveParam.bind(this)
		});
	}
	
	do_export() {
		// show export dialog
		app.clearError();
		var plugin = this.get_plugin_form_json();
		if (!plugin) return; // error
		
		this.showExportOptions({
			name: 'plugin',
			dataType: 'plugin',
			api: this.args.id ? 'update_plugin' : 'create_plugin',
			data: plugin
		});
	}
	
	go_edit_history() {
		Nav.go( '#Plugins?sub=history&id=' + this.plugin.id );
	}
	
	do_save_plugin() {
		// save changes to plugin
		app.clearError();
		var plugin = this.get_plugin_form_json();
		if (!plugin) return; // error
		
		this.plugin = plugin;
		
		Dialog.showProgress( 1.0, "Saving Plugin..." );
		app.api.post( 'app/update_plugin', plugin, this.save_plugin_finish.bind(this) );
	}
	
	save_plugin_finish(resp) {
		// new plugin saved successfully
		Dialog.hideProgress();
		if (!this.active) return; // sanity
		
		Nav.go( 'Plugins?sub=list' );
		app.showMessage('success', "The plugin was saved successfully.");
	}
	
	show_delete_plugin_dialog() {
		// show dialog confirming plugin delete action
		var self = this;
		
		// check for events first
		// var plugin_events = find_objects( app.events, { plugin: this.plugin.id } );
		// var num_events = plugin_events.length;
		// if (num_events) return app.doError("Sorry, you cannot delete a plugin that has events assigned to it.");
		
		Dialog.confirmDanger( 'Delete Plugin', "Are you sure you want to <b>permanently delete</b> the " + this.plugin.type + " plugin &ldquo;" + this.plugin.title + "&rdquo;?  There is no way to undo this action.", ['trash-can', 'Delete'], function(result) {
			if (result) {
				Dialog.showProgress( 1.0, "Deleting Plugin..." );
				app.api.post( 'app/delete_plugin', self.plugin, self.delete_plugin_finish.bind(self) );
			}
		} );
	}
	
	delete_plugin_finish(resp) {
		// finished deleting plugin
		var self = this;
		Dialog.hideProgress();
		if (!this.active) return; // sanity
		
		Nav.go('Plugins?sub=list', 'force');
		app.showMessage('success', "The " + this.plugin.type + " plugin &ldquo;" + this.plugin.title + "&rdquo; was deleted successfully.");
	}
	
	get_plugin_edit_html() {
		// get html for editing an plugin (or creating a new one)
		var html = '';
		var plugin = this.plugin;
		
		// title
		html += this.getFormRow({
			label: 'Plugin Title:',
			content: this.getFormText({
				id: 'fe_ep_title',
				spellcheck: 'false',
				value: plugin.title,
				onChange: '$P().suggestIDFromTitle()'
			}),
			caption: 'Enter the title of the plugin, for display purposes.'
		});
		
		// plugin id
		html += this.getFormRow({
			label: 'Plugin ID:',
			content: this.getFormText({
				id: 'fe_ep_id',
				class: 'monospace',
				spellcheck: 'false',
				onChange: '$P().checkPluginExists(this)',
				value: plugin.id
			}),
			suffix: '<div class="checker"></div>',
			caption: 'Enter a unique ID for the plugin (alphanumerics only).  Once created this cannot be changed.'
		});
		
		// enabled
		html += this.getFormRow({
			label: 'Status:',
			content: this.getFormCheckbox({
				id: 'fe_ep_enabled',
				label: 'Plugin Enabled',
				checked: plugin.enabled
			}),
			caption: 'Check this box to enable the plugin for use.'
		});
		
		// type
		html += this.getFormRow({
			label: 'Plugin Type:',
			content: this.getFormMenuSingle({
				id: 'fe_ep_type',
				title: 'Select Plugin Type',
				placeholder: 'Select type for plugin...',
				options: [
					{ id: 'action', title: 'Action Plugin', icon: 'eye-outline' },
					{ id: 'event', title: 'Event Plugin', icon: 'calendar-clock' },
					{ id: 'monitor', title: 'Monitor Plugin', icon: 'console' },
					{ id: 'scheduler', title: 'Scheduler Plugin', icon: 'clock-time-four-outline' }
				],
				onChange: '$P().setPluginType()',
				value: plugin.type || '',
				// 'data-shrinkwrap': 1
			}),
			caption: '<span id="s_ep_plugin_type_desc"></span>'
		});
		
		// icon
		html += this.getFormRow({
			label: 'Custom Icon:',
			content: this.getFormMenuSingle({
				id: 'fe_ep_icon',
				title: 'Select icon for plugin',
				placeholder: 'Select icon for plugin...',
				options: [['', '(None)']].concat( iconFontNames.map( function(name) { return { id: name, title: name, icon: name }; } ) ),
				value: plugin.icon || '',
				// 'data-shrinkwrap': 1
			}),
			caption: 'Optionally choose an icon for the plugin.'
		});
		
		// command
		html += this.getFormRow({
			label: 'Executable:',
			content: this.getFormText({
				id: 'fe_ep_command',
				class: 'monospace',
				spellcheck: 'false',
				value: plugin.command || '',
				onChange: '$P().setDefaultEditorMode()'
			}),
			caption: 'Enter the filesystem path to your executable, including any command-line arguments you require.  This can be an interpreter like <code>/bin/sh</code> or <code>/usr/bin/python</code>, or your own custom binary.  Do not include any pipes or redirects here.'
		});
		
		// script (codemirror)
		html += this.getFormRow({
			id: 'd_editor',
			label: 'Script:',
			content: this.getFormTextarea({
				id: 'fe_editor',
				class: 'monospace',
				rows: 5,
				value: (plugin.script || '') + "\n"
			}),
			caption: 'Optionally enter your Plugin source code here, which will be written to a temporary file and passed as an argument to your executable.  Leave this blank if your Plugin executable should run standalone.'
		});
		
		// params (non-monitor only)
		html += this.getFormRow({
			id: 'd_ep_params',
			label: 'Parameters:',
			content: '<div id="d_ep_params_table">' + this.getParamsTable() + '</div>',
			caption: 'Parameters are passed to your Plugin via JSON, and as environment variables. For example, you can use this to customize the PATH variable, if your Plugin requires it.'
		});
		
		// groups (monitor type only)
		html += this.getFormRow({
			id: 'd_ep_groups',
			label: 'Server Groups:',
			content: this.getFormMenuMulti({
				id: 'fe_ep_groups',
				title: 'Select Groups',
				placeholder: '(All Groups)',
				options: app.groups,
				values: plugin.groups || [],
				default_icon: 'server-network',
				'data-hold': 1
				// 'data-shrinkwrap': 1
			}),
			caption: 'Select which server group(s) should run the monitoring Plugin.'
		});
		
		// format (monitor type only)
		html += this.getFormRow({
			id: 'd_ep_format',
			label: 'Format:',
			content: this.getFormMenuSingle({
				id: 'fe_ep_format',
				title: 'Select Format',
				options: [['text','Text'], ['json','JSON'], ['xml', 'XML']],
				value: plugin.format || ''
			}),
			caption: 'Select the output format that the script generates, so it can be parsed correctly.'
		});
		
		// CWD
		html += this.getFormRow({
			label: 'Working Directory:',
			content: this.getFormText({
				id: 'fe_ep_cwd',
				class: 'monospace',
				spellcheck: 'false',
				value: plugin.cwd || ''
			}),
			caption: 'Optionally enter a custom working directory (CWD) for the Plugin to run from.  This defaults to the OS temp directory.'
		});
		
		// UID
		html += this.getFormRow({
			label: 'Run as User:',
			content: this.getFormText({
				id: 'fe_ep_uid',
				class: 'monospace',
				spellcheck: 'false',
				value: plugin.uid || ''
			}),
			caption: "Optionally set the User ID (UID) for the Plugin to run as.  The UID may be either numerical or a string ('root', 'www', etc.)."
		});
		
		// GID
		html += this.getFormRow({
			label: 'Run as Group:',
			content: this.getFormText({
				id: 'fe_ep_gid',
				class: 'monospace',
				spellcheck: 'false',
				value: plugin.gid || ''
			}),
			caption: "Optionally set the Group ID (GID) for the Plugin to run as.  The GID may be either numerical or a string ('wheel', 'admin', etc.)."
		});
		
		// notes
		html += this.getFormRow({
			label: 'Notes:',
			content: this.getFormTextarea({
				id: 'fe_ep_notes',
				rows: 5,
				value: plugin.notes
			}),
			caption: 'Optionally enter notes for the plugin, for your own internal use.'
		});
		
		return html;
	}
	
	setPluginType() {
		// swap out the plugin type dynamic caption
		var plugin_type = $('#fe_ep_type').val();
		var md = config.ui.plugin_type_descriptions[ plugin_type ];
		var html = marked(md, config.ui.marked_config).trim().replace(/^<p>(.+)<\/p>$/, '$1');
		this.div.find('#s_ep_plugin_type_desc').html( html );
		
		// hide/show sections based on new type
		switch (plugin_type) {
			case 'monitor':
				this.div.find('#d_ep_params').hide();
				this.div.find('#d_ep_groups').show();
				this.div.find('#d_ep_format').show();
			break;
			
			default:
				this.div.find('#d_ep_params').show();
				this.div.find('#d_ep_groups').hide();
				this.div.find('#d_ep_format').hide();
			break;
		} // switch plugin_type
	}
	
	renderParamEditor() {
		// render plugin param editor
		var html = this.getParamsTable();
		this.div.find('#d_ep_params_table').html( html );
		
		this.setupDraggableGrid({
			table_sel: this.div.find('div.data_grid'), 
			handle_sel: 'div.td_drag_handle', 
			drag_ghost_sel: 'div:nth-child(2)', 
			drag_ghost_x: 5, 
			drag_ghost_y: 10, 
			callback: this.moveParam.bind(this)
		});
	}
	
	getParamsTable() {
		// get html for params table
		var self = this;
		var html = '';
		var rows = this.params;
		var cols = ['<i class="mdi mdi-menu"></i>', 'Label', 'Type', 'Description', 'Actions'];
		var add_link = '<div class="button small secondary" onClick="$P().editParam(-1)"><i class="mdi mdi-plus-circle-outline">&nbsp;</i>New Param...</div>';
		
		var targs = {
			rows: rows,
			cols: cols,
			data_type: 'param',
			class: 'data_grid',
			empty_msg: add_link,
			always_append_empty_msg: true,
			grid_template_columns: '40px auto auto auto auto'
		};
		
		html += this.getCompactGrid(targs, function(item, idx) {
			var actions = [];
			actions.push( '<span class="link" onClick="$P().editParam('+idx+')"><b>Edit</b></span>' );
			actions.push( '<span class="link danger" onClick="$P().deleteParam('+idx+')"><b>Delete</b></span>' );
			
			var nice_type = self.ctype_labels[item.type];
			var nice_icon = self.ctype_icons[item.type];
			var nice_label_icon = item.locked ? 'lock' : 'cube-outline';
			
			var param = item;
			var pairs = [];
			switch (param.type) {
				case 'text':
					if (param.value.length) pairs.push([ 'Default', '&ldquo;' + param.value + '&rdquo;' ]);
					else pairs.push([ "(No default)" ]);
				break;
				
				case 'textarea':
					if (param.value.length) pairs.push([ 'Default', '(' + param.value.length + ' chars)' ]);
					else pairs.push([ "(No default)" ]);
				break;
				
				case 'code':
					if (param.value.length) pairs.push([ 'Default', '(' + param.value.length + ' chars)' ]);
					else pairs.push([ "(No default)" ]);
				break;
				
				case 'checkbox':
					pairs.push([ 'Default', param.value ? 'Checked' : 'Unchecked' ]);
					if (!param.value) nice_icon = 'checkbox-blank-outline';
				break;
				
				case 'hidden':
					pairs.push([ 'Value', '&ldquo;' + param.value + '&rdquo;' ]);
				break;
				
				case 'select':
					pairs.push([ 'Items', '(' + param.value + ')' ]);
				break;
			}
			for (var idy = 0, ley = pairs.length; idy < ley; idy++) {
				if (pairs[idy].length == 2) pairs[idy] = '<b>' + pairs[idy][0] + ':</b> ' + pairs[idy][1];
				else pairs[idy] = pairs[idy][0];
			}
			
			return [
				// '<div class="td_big mono">' + item.id + '</div>',
				'<div class="td_drag_handle" draggable="true" title="Drag to reorder"><i class="mdi mdi-menu"></i></div>',
				'<div class="td_big ellip" title="ID: ' + item.id + '"><i class="mdi mdi-' + nice_label_icon + '">&nbsp;</i><span class="link" onClick="$P().editParam('+idx+')">' + item.title + '</span></div>',
				'<div class="ellip"><i class="mdi mdi-' + nice_icon + '">&nbsp;</i>' + nice_type + '</div>',
				'<div class="ellip">' + pairs.join(', ') + '</div>',
				'<div class="">' + actions.join(' | ') + '</div>'
			];
		} ); // getCompactGrid
		
		return html;
	}
	
	moveParam($rows) {
		// user completed a drag-drop reorder op
		var self = this;
		var params = [];
		
		$rows.each( function(idx) {
			var $row = $(this);
			var id = $row.data('id');
			params.push( find_object( self.params, { id: id } ) );
		});
		
		this.params = this.plugin.params = params;
	}
	
	editParam(idx) {
		// show dialog to configure param
		var self = this;
		var param = (idx > -1) ? this.params[idx] : { type: 'text', value: '' };
		var title = (idx > -1) ? "Editing Parameter" : "New Parameter";
		var btn = (idx > -1) ? ['check-circle', "Apply Changes"] : ['plus-circle', "Add Param"];
		var plugin_type = $('#fe_ep_type').val();
		
		// hide code type if non-event plugin
		var ctypes = Object.keys(this.ctype_labels).map (function(key) { return { id: key, title: self.ctype_labels[key] }; } );
		sort_by( ctypes, 'title' );
		
		var html = '<div class="dialog_box_content">';
		
		// id
		html += this.getFormRow({
			label: 'Param ID:',
			content: this.getFormText({
				id: 'fe_epa_id',
				class: 'monospace',
				spellcheck: 'false',
				value: param.id
			}),
			caption: 'Enter a unique ID for the parameter (alphanumerics only).'
		});
		
		// label
		html += this.getFormRow({
			label: 'Label:',
			content: this.getFormText({
				id: 'fe_epa_title',
				spellcheck: 'false',
				value: param.title
			}),
			caption: 'Enter a label for the parameter, for display purposes.'
		});
		
		// type
		html += this.getFormRow({
			label: 'Control Type:',
			content: this.getFormMenuSingle({
				id: 'fe_epa_type',
				title: 'Select Control Type',
				options: ctypes,
				value: param.type
			}),
			caption: 'Select the desired control type for the parameter.'
		});
		
		// type-specific
		html += this.getFormRow({
			id: 'd_epa_value_text',
			label: 'Default Value:',
			content: this.getFormText({
				id: 'fe_epa_value_text',
				spellcheck: 'false',
				value: param.value || ''
			}),
			caption: 'Enter the default value for the text field.'
		});
		html += this.getFormRow({
			id: 'd_epa_value_textarea',
			label: 'Default Value:',
			content: this.getFormTextarea({
				id: 'fe_epa_value_textarea',
				rows: 5,
				spellcheck: 'false',
				value: (param.value || '').toString()
			}),
			caption: "Enter the default value for the text box."
		});
		html += this.getFormRow({
			id: 'd_epa_value_code',
			label: 'Default Value:',
			content: this.getFormTextarea({
				id: 'fe_epa_value_code',
				rows: 5,
				class: 'monospace',
				spellcheck: 'false',
				value: (param.value || '').toString()
			}),
			caption: "Enter the default value for the code editor."
		});
		html += this.getFormRow({
			id: 'd_epa_value_checkbox',
			label: 'Default State:',
			content: this.getFormCheckbox({
				id: 'fe_epa_value_checkbox',
				label: 'Checked',
				checked: !!param.value
			}),
			caption: 'Select the default state for the checkbox.'
		});
		html += this.getFormRow({
			id: 'd_epa_value_select',
			label: 'Menu Items:',
			content: this.getFormText({
				id: 'fe_epa_value_select',
				spellcheck: 'false',
				value: param.value || ''
			}),
			caption: "Enter items for the menu, separated by commas.  The first will be selected by default."
		});
		html += this.getFormRow({
			id: 'd_epa_value_hidden',
			label: 'Default Value:',
			content: this.getFormText({
				id: 'fe_epa_value_hidden',
				spellcheck: 'false',
				value: param.value || ''
			}),
			caption: 'Enter the default value for the hidden field.'
		});
		
		// admin lock
		html += this.getFormRow({
			label: 'Security:',
			content: this.getFormCheckbox({
				id: 'fe_epa_locked',
				label: 'Administrator Locked',
				checked: !!param.locked
			}),
			caption: 'Check this box to disallow changes from the event editor and API (except for administrators).'
		});
		
		html += '</div>';
		Dialog.confirm( title, html, btn, function(result) {
			if (!result) return;
			Dialog.hide();
			
			param.id = $('#fe_epa_id').val();
			param.title = $('#fe_epa_title').val();
			param.type = $('#fe_epa_type').val();
			param.locked = !!$('#fe_epa_locked').is(':checked');
			
			switch (param.type) {
				case 'text':
					param.value = $('#fe_epa_value_text').val();
				break;
				
				case 'textarea':
					param.value = $('#fe_epa_value_textarea').val();
				break;
				
				case 'code':
					param.value = $('#fe_epa_value_code').val();
				break;
				
				case 'checkbox':
					param.value = !!$('#fe_epa_value_checkbox').is(':checked');
				break;
				
				case 'select':
					param.value = $('#fe_epa_value_select').val();
				break;
				
				case 'hidden':
					param.value = $('#fe_epa_value_hidden').val();
				break;
			} // switch action.type
			
			// see if we need to add or replace
			if (idx == -1) {
				self.params.push(param);
			}
			
			// self.dirty = true;
			self.renderParamEditor();
		} ); // Dialog.confirm
		
		var change_param_type = function(new_type) {
			$('#d_epa_value_text, #d_epa_value_textarea, #d_epa_value_code, #d_epa_value_checkbox, #d_epa_value_select, #d_epa_value_hidden').hide();
			$('#d_epa_value_' + new_type).show();
			Dialog.autoResize();
		}; // change_action_type
		
		change_param_type(param.type);
		
		$('#fe_epa_type').on('change', function() {
			change_param_type( $(this).val() );
		}); // type change
		
		if (idx == -1) $('#fe_epa_id').focus();
		
		SingleSelect.init( $('#fe_epa_type') );
		Dialog.autoResize();
	}
	
	deleteParam(idx) {
		// delete selected param
		this.params.splice( idx, 1 );
		this.renderParamEditor();
	}
	
	get_plugin_form_json() {
		// get api key elements from form, used for new or edit
		var plugin = this.plugin;
		
		plugin.id = $('#fe_ep_id').val().replace(/\W+/g, '').toLowerCase();
		plugin.title = $('#fe_ep_title').val().trim();
		plugin.enabled = $('#fe_ep_enabled').is(':checked') ? true : false;
		plugin.type = $('#fe_ep_type').val();
		plugin.icon = $('#fe_ep_icon').val();
		plugin.command = $('#fe_ep_command').val().trim();
		plugin.script = this.editor.getValue().trim();
		plugin.cwd = $('#fe_ep_cwd').val();
		plugin.uid = $('#fe_ep_uid').val();
		plugin.gid = $('#fe_ep_gid').val();
		plugin.notes = $('#fe_ep_notes').val();
		
		if (!plugin.id.length) {
			return app.badField('#fe_ep_id', "Please enter a unique alphanumeric ID for the plugin.");
		}
		if (!plugin.title.length) {
			return app.badField('#fe_ep_title', "Please enter a title for the plugin.");
		}
		if (!plugin.command.length) {
			return app.badField('#fe_ep_command', "Please enter the executable path for the plugin.");
		}
		
		switch (plugin.type) {
			case 'monitor':
				this.params = plugin.params = [];
				plugin.groups = $('#fe_ep_groups').val();
				plugin.format = $('#fe_ep_format').val();
			break;
			
			default:
				plugin.groups = [];
				plugin.format = '';
			break;
		} // switch plugin_type
		
		return plugin;
	}
	
	checkPluginExists(field) {
		// check if plugin exists, update UI checkbox
		// called after field changes
		var $field = $(field);
		var id = trim( $field.val().toLowerCase() );
		var $elem = $field.closest('.form_row').find('.fr_suffix .checker');
		
		if (id.match(/^\w+$/)) {
			// check with cache
			if (find_object(app.plugins, { id: id })) {
				// plugin taken
				$elem.css('color','red').html('<span class="mdi mdi-alert-circle"></span>').attr('title', "Plugin ID is taken.");
				$field.addClass('warning');
			}
			else {
				// plugin is valid and available!
				$elem.css('color','green').html('<span class="mdi mdi-check-circle"></span>').attr('title', "Plugin ID is available!");
				$field.removeClass('warning');
			}
		}
		else if (id.length) {
			// bad id
			$elem.css('color','red').html('<span class="mdi mdi-alert-decagram"></span>').attr('title', "Plugin ID is malformed.");
			$field.addClass('warning');
		}
		else {
			// empty
			$elem.html('').removeAttr('title');
			$field.removeClass('warning');
		}
	}
	
	setDefaultEditorMode() {
		// set default editor mode from command text field
		this.defaultEditorMode = app.getCodemirrorModeFromBinary( $('#fe_ep_command').val() );
		
		if (this.defaultEditorMode && this.editor && this.editor.options && (this.editor.options.mode === null)) {
			Debug.trace('debug', "Setting default language: " + this.defaultEditorMode);
			this.editor.setOption('mode', this.defaultEditorMode);
			this.editor.refresh();
		}
	}
	
	onResize() {
		// resize codemirror to match
		this.handleEditorResize();
	}
	
	onThemeChange(theme) {
		// change codemirror theme too
		this.handleEditorThemeChange(theme);
	}
	
	onDataUpdate(key, data) {
		// refresh list if plugins were updated
		if ((key == 'plugins') && (this.args.sub == 'list')) this.gosub_list(this.args);
	}
	
	onDeactivate() {
		// called when page is deactivated
		delete this.plugins;
		delete this.plugin;
		delete this.params;
		delete this.defaultEditorMode;
		this.cleanupRevHistory();
		this.killEditor();
		this.div.html( '' );
		return true;
	}
	
};

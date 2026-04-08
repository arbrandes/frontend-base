App ``provides`` for Inter-App Data
####################################

Status
======

Proposed


Context
=======

frontend-base applications currently communicate through two structured
mechanisms: ``routes`` and ``slots``.  Both are defined in the ``App`` interface
and consumed directly by frontend-base's runtime.

As the platform evolves, however, situations arise where apps need to share data
with each other that frontend-base itself has no reason to understand.  A
concrete example is the course navigation bar introduced in the header app.
The header needs to know two things from other apps:

1. Which apps want the course navigation bar to appear (currently a hardcoded
   list of roles in ``constants.ts``).

2. Which URL patterns each app handles client-side, so the navigation bar can
   use ``navigate()`` instead of a full page load for same-origin tab URLs.

There is no place in the current ``App`` interface to express this.  Extending
the interface with a dedicated field (e.g. ``courseNavigation``) would work for
this specific case, but the pattern would repeat: every new inter-app
coordination need would require another field, another type change, and another
release of frontend-base.

Meanwhile, ``routes`` and ``slots`` are structured because frontend-base's
runtime needs to interpret them directly.  It builds a router from ``routes``
and renders widgets from ``slots``.  Any new field that frontend-base itself
must consume deserves the same treatment: a dedicated, typed field.

But for data that flows between apps - where frontend-base is just the conduit -
a generic mechanism is more appropriate.


Decision
========

Add an optional ``provides`` field to the ``App`` interface::

    export interface App {
      appId: string,
      messages?: LocalizedMessages,
      routes?: RoleRouteObject[],
      providers?: AppProvider[],
      slots?: SlotOperation[],
      config?: AppConfig,
      provides?: Record<string, unknown>,
    }

``provides`` is a flat key-value map where each key is the ``appId`` of the
consuming app and the value is whatever that consumer expects.  frontend-base
stores this data and exposes it through a runtime function, but does not
interpret it.

A runtime helper would look something like::

    // Returns all `provides` entries keyed to the given appId.
    function getProvidedData(consumerAppId: string): Record<string, unknown>[]


Guidelines
==========

1. ``provides`` is for inter-app data that frontend-base does not need to
   interpret.  If frontend-base's runtime must consume the data to function
   (as it does with routes and slots), a dedicated typed field on ``App`` is
   the right choice.

2. Keys in ``provides`` should be the ``appId`` of the consuming app.  This
   keeps the namespace unambiguous and makes it easy for a consumer to discover
   everything provided to it.

3. The shape of the value under each key is a contract between the providing and
   consuming apps.  It is not enforced by frontend-base.  Consuming apps should
   validate or type-guard the data they receive.

4. ``provides`` should not be used as a back door to modify frontend-base's
   behavior.  It is not a configuration mechanism for the runtime.


Consequences
============

Apps gain a channel for coordination that does not require changes to
frontend-base's ``App`` type or runtime for each new use case.  The ``App``
interface grows by one optional field and remains stable as new inter-app
patterns emerge.

The trade-off is that ``provides`` data is untyped from frontend-base's
perspective.  Consuming apps bear the responsibility of defining, documenting,
and validating the shape of the data they expect.  This is acceptable because
the data is, by definition, outside frontend-base's domain.

Course navigation bar example
-----------------------------

As a concrete illustration, the instructor app would declare::

    const config: App = {
      appId: 'org.openedx.frontend.app.instructor',
      provides: {
        'org.openedx.frontend.app.header': {
          courseNavigationUrlPattern: /^\/instructor\//,
        },
      },
      routes: [...],
      slots: [...],
    };

The header app would then collect ``provides`` entries keyed to its own
``appId`` from all registered apps at runtime.  From this it derives which tab
URLs can be navigated client-side, and uses a slot ``condition.callback`` to
determine whether to render the course navigation bar at all::

    // header app slot config
    {
      slotId: 'org.openedx.frontend.slot.header.courseNavigationBar.v1',
      id: 'org.openedx.frontend.widget.header.courseTabsNavigation.v1',
      op: WidgetOperationTypes.APPEND,
      component: CourseTabsNavigation,
      condition: {
        callback: () => {
          const providers = getProvidedData('org.openedx.frontend.app.header');
          return providers.some(data =>
            data.courseNavigationUrlPattern?.test(window.location.pathname)
          );
        },
      },
    }

This replaces the hardcoded roles list in ``constants.ts`` with a dynamic
check: the nav bar renders when the current URL matches a pattern provided by
any registered app.  The ``condition.callback`` mechanism was designed for
exactly this kind of dynamic evaluation.
